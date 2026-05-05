<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use App\Models\Device;
use App\Models\Computer;
use App\Models\Printer;
use App\Models\Monitor;
use App\Models\HardDrive;
use App\Models\Cartridge;
use App\Models\DeviceType;
use App\Models\DeviceModel;
use App\Models\Location;
use App\Models\Department;
use App\Models\Status;
use App\Models\DriveStatus;
use App\Models\CartridgeStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * ImportExportController
 *
 * GET  /export         — Export full snapshot (devices + assignments + movements) as JSON
 * POST /import         — Import devices from a JSON or CSV payload
 * GET  /export/csv     — Export devices as CSV (downloadable)
 */
class ImportExportController extends Controller
{
    /* ─────────────────────────────────────────
     |  GET /export
     |  Full JSON export — devices, assignments, movements
    ───────────────────────────────────────── */
    public function export()
    {
        $devices = Device::with([
            'deviceType', 'manufacturer', 'deviceModel',
            'location.site', 'department', 'user',
            'status', 'driveStatus', 'cartridgeStatus',
            'computer', 'printer', 'monitor', 'hardDrive', 'cartridge',
        ])->get();

        $assignments = \App\Models\DeviceAssignment::with(['device', 'user'])->get();
        $driveAssignments = \App\Models\HardDriveAssignment::with(['hardDrive', 'computer'])->get();
        $cartridgeAssignments = \App\Models\CartridgeAssignment::with(['cartridge', 'printer'])->get();
        $movements = \App\Models\DeviceMovement::with(['device', 'fromLocation', 'toLocation'])->get();
        $logs = \App\Models\DeviceLog::with('device')->latest('logged_at')->take(500)->get();

        return response()->json([
            'exported_at'           => now()->toISOString(),
            'summary' => [
                'devices'            => $devices->count(),
                'assignments'        => $assignments->count(),
                'drive_assignments'  => $driveAssignments->count(),
                'cart_assignments'   => $cartridgeAssignments->count(),
                'movements'          => $movements->count(),
            ],
            'devices'                => $devices,
            'assignments'            => $assignments,
            'drive_assignments'      => $driveAssignments,
            'cartridge_assignments'  => $cartridgeAssignments,
            'movements'              => $movements,
            'recent_logs'            => $logs,
        ]);
    }

    /* ─────────────────────────────────────────
     |  GET /export/csv
     |  CSV download of all devices
    ───────────────────────────────────────── */
    public function exportCsv()
    {
        $devices = Device::with([
            'deviceType', 'manufacturer', 'deviceModel',
            'location.site', 'department', 'user',
            'status', 'driveStatus', 'cartridgeStatus',
            'computer', 'printer', 'monitor', 'hardDrive', 'cartridge',
        ])->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="inventory_export_' . now()->format('Ymd_His') . '.csv"',
        ];

        $columns = [
            'id', 'label', 'serial_number', 'category',
            'device_type', 'manufacturer', 'model',
            'location', 'site', 'department', 'assigned_to',
            'status', 'cpu', 'ram', 'imei', 'phone_number',
            'printer_type', 'duplex', 'color',
            'panel_type', 'size_inches',
            'drive_type', 'capacity_gb',
            'ink_type', 'compatibility',
            'comment', 'created_at',
        ];

        $callback = function () use ($devices, $columns) {
            $out = fopen('php://output', 'w');
            // UTF-8 BOM for Excel
            fputs($out, "\xEF\xBB\xBF");
            fputcsv($out, $columns);

            foreach ($devices as $d) {
                $status = match ($d->category) {
                    'hard_drive' => $d->driveStatus?->name,
                    'cartridge'  => $d->cartridgeStatus?->name,
                    default      => $d->status?->name,
                };

                fputcsv($out, [
                    $d->id,
                    $d->label,
                    $d->serial_number ?? '',
                    $d->category,
                    $d->deviceType?->name ?? '',
                    $d->manufacturer?->name ?? $d->deviceModel?->manufacturer?->name ?? '',
                    $d->deviceModel?->name ?? '',
                    $d->location?->name ?? '',
                    $d->location?->site?->name ?? '',
                    $d->department?->name ?? '',
                    $d->user?->name ?? '',
                    $status ?? '',
                    $d->computer?->cpu ?? '',
                    $d->computer?->ram ?? '',
                    $d->computer?->imei ?? '',
                    $d->computer?->phone_number ?? '',
                    $d->printer?->printer_type ?? '',
                    $d->printer ? ($d->printer->duplex ? 'Yes' : 'No') : '',
                    $d->printer ? ($d->printer->color_support ? 'Yes' : 'No') : '',
                    $d->monitor?->panel_type ?? '',
                    $d->monitor?->size_inches ?? '',
                    $d->hardDrive?->drive_type ?? '',
                    $d->hardDrive?->capacity_gb ?? '',
                    $d->cartridge?->ink_type ?? '',
                    $d->cartridge?->printer_compatibility ?? '',
                    $d->comment ?? '',
                    $d->created_at->toDateString(),
                ]);
            }

            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }

    /* ─────────────────────────────────────────
     |  POST /import
     |  Accepts JSON body or multipart file upload.
     |
     |  JSON body format (row-by-row):
     |  {
     |    "devices": [
     |      {
     |        "label":          "PC-999",        // required, unique
     |        "serial_number":  "SN-999",        // required, unique
     |        "category":       "computer",       // required
     |        "device_type":    "Laptop",         // name string OR id
     |        "model":          "ThinkPad T14",   // name string, matched by name
     |        "location":       "IT Office",      // name string, matched by name
     |        "status":         "Reserved",       // name string
     |        "department":     "IT",             // name string
     |        "cpu":            "Intel i5",
     |        "ram":            "8GB",
     |        "comment":        "Imported"
     |      }
     |    ]
     |  }
     |
     |  Returns a summary: { created, skipped, errors }
    ───────────────────────────────────────── */
    public function import(Request $request)
    {
        $validated = $request->validate([
            'devices'   => 'required|array|min:1|max:500',
            'devices.*' => 'array',
        ]);

        $rows    = $validated['devices'];
        $created = 0;
        $skipped = 0;
        $errors  = [];

        // Pre-load lookup maps for performance
        $typeMap     = DeviceType::pluck('id', 'name');
        $modelMap    = DeviceModel::pluck('id', 'name');
        $locationMap = Location::pluck('id', 'name');
        $deptMap     = Department::pluck('id', 'name');
        $statusMap   = Status::pluck('id', 'name');
        $driveStatusMap = DriveStatus::pluck('id', 'name');
        $cartStatusMap  = CartridgeStatus::pluck('id', 'name');

        foreach ($rows as $idx => $row) {
            $rowNum = $idx + 1;

            try {
                // Skip if label already exists
                if (Device::where('label', $row['label'] ?? '')->exists()) {
                    $skipped++;
                    continue;
                }

                // Resolve device type
                $typeId = null;
                if (!empty($row['device_type_id'])) {
                    $typeId = (int) $row['device_type_id'];
                } elseif (!empty($row['device_type'])) {
                    $typeId = $typeMap[$row['device_type']] ?? null;
                }
                if (!$typeId) {
                    $errors[] = "Row {$rowNum}: device_type not found ({$row['device_type']})";
                    $skipped++;
                    continue;
                }

                $deviceType = DeviceType::find($typeId);
                $category   = $deviceType->category;

                // Resolve optional FKs
                $modelId    = !empty($row['device_model_id']) ? (int)$row['device_model_id']
                            : (!empty($row['model'])    ? ($modelMap[$row['model']] ?? null) : null);
                $locationId = !empty($row['location_id']) ? (int)$row['location_id']
                            : (!empty($row['location']) ? ($locationMap[$row['location']] ?? null) : null);
                $deptId     = !empty($row['department_id']) ? (int)$row['department_id']
                            : (!empty($row['department']) ? ($deptMap[$row['department']] ?? null) : null);

                // Auto-fill manufacturer from model
                $manufacturerId = null;
                if ($modelId) {
                    $model = DeviceModel::with('manufacturer')->find($modelId);
                    $manufacturerId = $model?->manufacturer_id;
                }

                // Resolve status
                $statusId     = null;
                $driveStatusId = null;
                $cartStatusId = null;

                $statusName = $row['status'] ?? null;
                switch ($category) {
                    case 'hard_drive':
                        $driveStatusId = !empty($row['drive_status_id']) ? (int)$row['drive_status_id']
                            : ($statusName ? ($driveStatusMap[$statusName] ?? null) : null);
                        $driveStatusId ??= $driveStatusMap['InStock/New'] ?? null;
                        break;
                    case 'cartridge':
                        $cartStatusId = !empty($row['cartridge_status_id']) ? (int)$row['cartridge_status_id']
                            : ($statusName ? ($cartStatusMap[$statusName] ?? null) : null);
                        $cartStatusId ??= $cartStatusMap['Full'] ?? null;
                        break;
                    default:
                        $statusId = !empty($row['status_id']) ? (int)$row['status_id']
                            : ($statusName ? ($statusMap[$statusName] ?? null) : null);
                        $statusId ??= $statusMap['Reserved'] ?? null;
                }

                DB::transaction(function () use (
                    $row, $category, $typeId, $modelId, $locationId, $deptId,
                    $manufacturerId, $statusId, $driveStatusId, $cartStatusId,
                    &$created
                ) {
                    $device = Device::create([
                        'label'               => $row['label'],
                        'serial_number'       => $row['serial_number'] ?? null,
                        'category'            => $category,
                        'device_type_id'      => $typeId,
                        'device_model_id'     => $modelId,
                        'manufacturer_id'     => $manufacturerId,
                        'location_id'         => $locationId,
                        'department_id'       => $deptId,
                        'status_id'           => $statusId,
                        'drive_status_id'     => $driveStatusId,
                        'cartridge_status_id' => $cartStatusId,
                        'comment'             => $row['comment'] ?? null,
                    ]);

                    // Create specialized record
                    match ($category) {
                        'computer' => Computer::create([
                            'device_id'    => $device->id,
                            'cpu'          => $row['cpu'] ?? null,
                            'ram'          => $row['ram'] ?? null,
                            'imei'         => $row['imei'] ?? null,
                            'phone_number' => $row['phone_number'] ?? null,
                        ]),
                        'printer' => Printer::create([
                            'device_id'     => $device->id,
                            'printer_type'  => $row['printer_type'] ?? 'laser',
                            'duplex'        => (bool)($row['duplex'] ?? false),
                            'color_support' => (bool)($row['color'] ?? false),
                        ]),
                        'monitor' => Monitor::create([
                            'device_id'    => $device->id,
                            'panel_type'   => $row['panel_type'] ?? null,
                            'size_inches'  => $row['size_inches'] ?? null,
                            'video_inputs' => isset($row['video_inputs']) ? (array)$row['video_inputs'] : null,
                        ]),
                        'hard_drive' => HardDrive::create([
                            'device_id'   => $device->id,
                            'drive_type'  => $row['drive_type'] ?? 'HDD',
                            'capacity_gb' => (int)($row['capacity_gb'] ?? 0),
                        ]),
                        'cartridge' => Cartridge::create([
                            'device_id'             => $device->id,
                            'ink_type'              => $row['ink_type'] ?? 'laser',
                            'printer_compatibility' => $row['compatibility'] ?? $row['printer_compatibility'] ?? '',
                        ]),
                        default => null,
                    };

                    $created++;
                });

            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum} ({$row['label']}): " . $e->getMessage();
                $skipped++;
            }
        }

        return response()->json([
            'created' => $created,
            'skipped' => $skipped,
            'errors'  => $errors,
            'message' => "{$created} devices imported, {$skipped} skipped.",
        ], $errors ? 207 : 200);
    }
}