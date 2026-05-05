<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Computer;
use App\Models\Printer;
use App\Models\Monitor;
use App\Models\HardDrive;
use App\Models\Cartridge;
use App\Models\DeviceType;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceController extends Controller
{
    public function __construct(protected DeviceLogService $logger) {}

    /* ─────────────────────────────────────────
     |  GET /devices
    ───────────────────────────────────────── */
    public function index(Request $request)
    {
        $query = Device::with([
            'deviceType',
            'manufacturer',
            'deviceModel',
            'location.site',
            'department',
            'user',
            'status',
            'driveStatus',
            'cartridgeStatus',
            // Eager load the specialized detail for each category
            'computer',
            'printer',
            'monitor',
            'hardDrive',
            'cartridge',
        ]);

        // Optional filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sub) use ($q) {
                $sub->where('label', 'like', "%{$q}%")
                    ->orWhere('serial_number', 'like', "%{$q}%");
            });
        }

        return $query->latest()->get();
    }

    /* ─────────────────────────────────────────
     |  POST /devices
    ───────────────────────────────────────── */
    public function store(Request $request)
    {
        // Step 1: validate shared base fields
        $base = $request->validate([
            'label'           => 'required|string|unique:devices,label',
            'serial_number'   => 'nullable|string|unique:devices,serial_number',
            'device_type_id'  => 'required|exists:device_types,id',
            'manufacturer_id' => 'nullable|exists:manufacturers,id',
            'device_model_id' => 'nullable|exists:device_models,id',
            'location_id'     => 'nullable|exists:locations,id',
            'department_id'   => 'nullable|exists:departments,id',
            'comment'         => 'nullable|string',
            // Status fields — only one should be set based on category
            'status_id'           => 'nullable|exists:statuses,id',
            'drive_status_id'     => 'nullable|exists:drive_statuses,id',
            'cartridge_status_id' => 'nullable|exists:cartridge_statuses,id',
        ]);

        // Resolve category from the device type
        $deviceType = DeviceType::findOrFail($base['device_type_id']);
        $category   = $deviceType->category;

        // Step 2: validate category-specific fields
        $specific = match ($category) {
            'computer' => $request->validate([
                'cpu' => 'nullable|string',
                'ram' => 'nullable|string',
            ]),
            'printer' => $request->validate([
                'printer_type'  => 'required|in:laser,inkjet',
                'duplex'        => 'boolean',
                'color_support' => 'boolean',
            ]),
            'monitor' => $request->validate([
                'panel_type'   => 'nullable|in:IPS,TN,VA,OLED',
                'size_inches'  => 'nullable|numeric|min:1|max:100',
                'video_inputs' => 'nullable|array',
                'video_inputs.*' => 'string|in:HDMI,DisplayPort,VGA,DVI,USB-C',
            ]),
            'hard_drive' => $request->validate([
                'drive_type'  => 'required|in:HDD,SSD,NVMe',
                'capacity_gb' => 'required|integer|min:1',
            ]),
            'cartridge' => $request->validate([
                'ink_type'               => 'required|in:laser,inkjet',
                'printer_compatibility'  => 'required|string',
            ]),
            default => [],
        };

        return DB::transaction(function () use ($base, $specific, $category, $deviceType) {
            // Create base device record
            $device = Device::create(array_merge($base, ['category' => $category]));

            // Create the specialized record
            match ($category) {
                'computer'   => Computer::create(array_merge(['device_id' => $device->id], $specific)),
                'printer'    => Printer::create(array_merge(['device_id' => $device->id], $specific)),
                'monitor'    => Monitor::create(array_merge(['device_id' => $device->id], $specific)),
                'hard_drive' => HardDrive::create(array_merge(['device_id' => $device->id], $specific)),
                'cartridge'  => Cartridge::create(array_merge(['device_id' => $device->id], $specific)),
                default      => null,
            };

            return response()->json(
                $device->load($this->withRelations($category)),
                201
            );
        });
    }

    /* ─────────────────────────────────────────
     |  GET /devices/:id
    ───────────────────────────────────────── */
    public function show($id)
    {
        $device = Device::with([
            'deviceType',
            'manufacturer',
            'deviceModel',
            'location.site',
            'department',
            'user',
            'status',
            'driveStatus',
            'cartridgeStatus',
            'computer',
            'printer',
            'monitor',
            'hardDrive',
            'cartridge',
            'assignments.user',
            'movements.fromLocation',
            'movements.toLocation',
            'logs',
        ])->findOrFail($id);

        return $device;
    }

    /* ─────────────────────────────────────────
     |  PUT /devices/:id
    ───────────────────────────────────────── */
    public function update(Request $request, $id)
    {
        $device = Device::findOrFail($id);

        $base = $request->validate([
            'label'           => 'sometimes|string|unique:devices,label,' . $id,
            'serial_number'   => 'nullable|string|unique:devices,serial_number,' . $id,
            'manufacturer_id' => 'nullable|exists:manufacturers,id',
            'device_model_id' => 'nullable|exists:device_models,id',
            'location_id'     => 'nullable|exists:locations,id',
            'department_id'   => 'nullable|exists:departments,id',
            'comment'         => 'nullable|string',
        ]);

        // Status update — detect manual status change and log it
        $statusField = $device->getStatusFkName();
        $statusRules = match ($device->category) {
            'hard_drive' => ['drive_status_id'     => 'sometimes|exists:drive_statuses,id'],
            'cartridge'  => ['cartridge_status_id' => 'sometimes|exists:cartridge_statuses,id'],
            default      => ['status_id'           => 'sometimes|exists:statuses,id'],
        };

        $statusData = $request->validate($statusRules);

        return DB::transaction(function () use ($device, $base, $statusData, $statusField) {
            // Detect status change before updating
            if (isset($statusData[$statusField]) &&
                $statusData[$statusField] != $device->$statusField) {

                $oldStatus = $device->getEffectiveStatus()?->name ?? 'none';
                $device->update(array_merge($base, $statusData));
                $newStatus = $device->fresh()->getEffectiveStatus()?->name ?? 'none';

                $this->logger->logStatusChange($device->id, $oldStatus, $newStatus);
            } else {
                $device->update(array_merge($base, $statusData));
            }

            // Update category-specific fields if provided
            $this->updateSpecific($device, request());

            return response()->json($device->fresh()->load($this->withRelations($device->category)));
        });
    }

    /* ─────────────────────────────────────────
     |  DELETE /devices/:id
    ───────────────────────────────────────── */
    public function destroy($id)
    {
        Device::destroy($id);
        return response()->json(['message' => 'Device deleted.']);
    }

    /* ─────────────────────────────────────────
     |  HELPERS
    ───────────────────────────────────────── */

    /**
     * Returns the correct eager-load relations array for a given category.
     */
    private function withRelations(string $category): array
    {
        $base = [
            'deviceType', 'manufacturer', 'deviceModel',
            'location.site', 'department', 'status',
            'driveStatus', 'cartridgeStatus',
        ];

        return array_merge($base, match ($category) {
            'computer'   => ['computer', 'user'],
            'printer'    => ['printer'],
            'monitor'    => ['monitor', 'user'],
            'hard_drive' => ['hardDrive'],
            'cartridge'  => ['cartridge'],
            default      => [],
        });
    }

    /**
     * Update the specialized row (computers, printers, etc.) if the request
     * contains relevant fields. Silently skips if not applicable.
     */
    private function updateSpecific(Device $device, Request $request): void
    {
        match ($device->category) {
            'computer' => $device->computer?->update(
                $request->only(['cpu', 'ram'])
            ),
            'printer' => $device->printer?->update(
                $request->only(['printer_type', 'duplex', 'color_support'])
            ),
            'monitor' => $device->monitor?->update(
                $request->only(['panel_type', 'size_inches', 'video_inputs'])
            ),
            'hard_drive' => $device->hardDrive?->update(
                $request->only(['drive_type', 'capacity_gb'])
            ),
            'cartridge' => $device->cartridge?->update(
                $request->only(['ink_type', 'printer_compatibility'])
            ),
            default => null,
        };
    }
}
