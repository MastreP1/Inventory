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
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceController extends Controller
{
    /**
     * Statuses that trigger auto-relocation to "Stock" and user clearance.
     * Applies to both regular statuses (Reserved) and drive statuses (InStock/New, InStock/Used).
     */
    private const STOCK_STATUSES = [
        'reserved',
        'instock/new',
        'instock/used',
    ];

    public function __construct(protected DeviceLogService $logger) {}

    /* ─────────────────────────────────────────
     |  GET /devices
    ───────────────────────────────────────── */
    public function index(Request $request)
    {
        $query = Device::with([
            'deviceType', 'manufacturer', 'deviceModel.manufacturer',
            'location.site', 'department', 'user',
            'status', 'driveStatus', 'cartridgeStatus',
            'computer', 'printer', 'monitor', 'hardDrive', 'cartridge',
        ]);

        if ($request->filled('category')) {
            // Support comma-separated categories e.g. hard_drive,cartridge
            $cats = explode(',', $request->category);
            $query->whereIn('category', $cats);
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
        $base = $request->validate([
            'label'           => 'required|string|unique:devices,label',
            'serial_number'   => 'required|string|unique:devices,serial_number',
            'device_type_id'  => 'required|exists:device_types,id',
            'manufacturer_id' => 'nullable|exists:manufacturers,id',
            'device_model_id' => 'required|exists:device_models,id',
            'location_id'     => 'nullable|exists:locations,id',
            'department_id'   => 'nullable|exists:departments,id',
            'comment'         => 'nullable|string',
            'status_id'           => 'nullable|exists:statuses,id',
            'drive_status_id'     => 'nullable|exists:drive_statuses,id',
            'cartridge_status_id' => 'nullable|exists:cartridge_statuses,id',
        ]);

        // Resolve category from device type
        $deviceType = DeviceType::findOrFail($base['device_type_id']);
        $category   = $deviceType->category;

        // Auto-assign manufacturer from model if not provided
        if (empty($base['manufacturer_id']) && !empty($base['device_model_id'])) {
            $model = DeviceModel::find($base['device_model_id']);
            if ($model && $model->manufacturer_id) {
                $base['manufacturer_id'] = $model->manufacturer_id;
            }
        }

        // Category-specific validation
        $specific = match ($category) {
            'computer' => $request->validate([
                'cpu'          => 'nullable|string',
                'ram'          => 'nullable|string',
                'imei'         => 'nullable|string',
                'phone_number' => 'nullable|string',
            ]),
            'printer' => $request->validate([
                'printer_type'  => 'required|in:laser,inkjet',
                'duplex'        => 'boolean',
                'color_support' => 'boolean',
            ]),
            'monitor' => $request->validate([
                'panel_type'     => 'nullable|in:IPS,TN,VA,OLED',
                'size_inches'    => 'nullable|numeric|min:1|max:100',
                'video_inputs'   => 'nullable|array',
                'video_inputs.*' => 'string|in:HDMI,DisplayPort,VGA,DVI,USB-C',
            ]),
            'hard_drive' => $request->validate([
                'drive_type'  => 'required|in:HDD,SSD,NVMe',
                'capacity_gb' => 'required|integer|min:1',
            ]),
            'cartridge' => $request->validate([
                'ink_type'              => 'required|in:laser,inkjet',
                'printer_compatibility' => 'required|string',
            ]),
            default => [],
        };

        return DB::transaction(function () use ($base, $specific, $category) {
            // If no status provided, auto-default to Reserved/InStock/New
            $this->applyDefaultStatus($base, $category);

            $device = Device::create(array_merge($base, ['category' => $category]));

            match ($category) {
                'computer'   => Computer::create(array_merge(['device_id' => $device->id], $specific)),
                'printer'    => Printer::create(array_merge(['device_id' => $device->id], $specific)),
                'monitor'    => Monitor::create(array_merge(['device_id' => $device->id], $specific)),
                'hard_drive' => HardDrive::create(array_merge(['device_id' => $device->id], $specific)),
                'cartridge'  => Cartridge::create(array_merge(['device_id' => $device->id], $specific)),
                default      => null,
            };

            return response()->json(
                $device->fresh()->load($this->withRelations($category)),
                201
            );
        });
    }

    /* ─────────────────────────────────────────
     |  GET /devices/:id
    ───────────────────────────────────────── */
    public function show($id)
    {
        return Device::with([
            'deviceType', 'manufacturer', 'deviceModel.manufacturer',
            'location.site', 'department', 'user',
            'status', 'driveStatus', 'cartridgeStatus',
            'computer', 'printer', 'monitor', 'hardDrive', 'cartridge',
            'assignments.user', 'movements.fromLocation', 'movements.toLocation', 'logs',
        ])->findOrFail($id);
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
            'user_id'         => 'nullable|exists:users,id',
            'comment'         => 'nullable|string',
        ]);

        // Auto-assign manufacturer from model when model changes
        if (isset($base['device_model_id']) && $base['device_model_id']) {
            $model = DeviceModel::find($base['device_model_id']);
            if ($model && $model->manufacturer_id && empty($base['manufacturer_id'])) {
                $base['manufacturer_id'] = $model->manufacturer_id;
            }
        }

        // Status field based on category
        $statusField = $device->getStatusFkName();
        $statusRules = match ($device->category) {
            'hard_drive' => ['drive_status_id'     => 'sometimes|exists:drive_statuses,id'],
            'cartridge'  => ['cartridge_status_id' => 'sometimes|exists:cartridge_statuses,id'],
            default      => ['status_id'           => 'sometimes|exists:statuses,id'],
        };
        $statusData = $request->validate($statusRules);

        return DB::transaction(function () use ($device, $base, $statusData, $statusField) {
            $statusChanged = isset($statusData[$statusField]) &&
                             $statusData[$statusField] != $device->$statusField;

            // Detect if new status triggers auto-stock-location
            $autoStock = false;
            $newStatusName = null;
            if ($statusChanged) {
                $oldStatus = $device->getEffectiveStatus()?->name ?? 'none';

                // Resolve new status name
                $newStatusName = $this->resolveStatusName($device->category, $statusData[$statusField]);
                $autoStock     = $this->isStockStatus($newStatusName);

                $device->update(array_merge($base, $statusData));
                $newStatus = $device->fresh()->getEffectiveStatus()?->name ?? 'none';
                $this->logger->logStatusChange($device->id, $oldStatus, $newStatus);

                // Auto-relocate to Stock and clear user if status is "stock" type
                if ($autoStock) {
                    $this->applyStockRelocation($device);
                }
            } else {
                $device->update(array_merge($base, $statusData));
            }

            // Update category-specific fields
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
     * Resolve the name of a status by its ID for a given category.
     */
    private function resolveStatusName(string $category, $statusId): string
    {
        return match ($category) {
            'hard_drive' => \App\Models\DriveStatus::find($statusId)?->name ?? '',
            'cartridge'  => \App\Models\CartridgeStatus::find($statusId)?->name ?? '',
            default      => \App\Models\Status::find($statusId)?->name ?? '',
        };
    }

    /**
     * Check if a status name is a "stock" status that triggers auto-relocation.
     */
    private function isStockStatus(string $name): bool
    {
        return in_array(strtolower($name), self::STOCK_STATUSES, true);
    }

    /**
     * Move device to the "Stock" location and clear user_id.
     * Logs both changes.
     */
    private function applyStockRelocation(Device $device): void
    {
        $stockLocation = Location::where('name', 'Stock')->first();

        $updates = ['user_id' => null];
        if ($stockLocation) {
            $updates['location_id'] = $stockLocation->id;
        }

        $oldLocationId = $device->location_id;
        $oldUserId     = $device->user_id;

        $device->update($updates);

        // Log the auto-relocation
        $this->logger->log($device->id, 'auto_stock_relocation', [
            'from_location_id' => $oldLocationId,
            'to_location_id'   => $stockLocation?->id,
            'cleared_user_id'  => $oldUserId,
            'reason'           => 'status_changed_to_stock',
        ]);
    }

    /**
     * Set a default status if none is provided, based on category.
     */
    private function applyDefaultStatus(array &$base, string $category): void
    {
        switch ($category) {
            case 'hard_drive':
                if (empty($base['drive_status_id'])) {
                    $base['drive_status_id'] = \App\Models\DriveStatus::where('name', 'InStock/New')->first()?->id;
                }
                break;
            case 'cartridge':
                if (empty($base['cartridge_status_id'])) {
                    $base['cartridge_status_id'] = \App\Models\CartridgeStatus::where('name', 'Full')->first()?->id;
                }
                break;
            default:
                if (empty($base['status_id'])) {
                    $base['status_id'] = \App\Models\Status::where('name', 'Reserved')->first()?->id;
                }
        }
    }

    private function withRelations(string $category): array
    {
        $base = [
            'deviceType', 'manufacturer', 'deviceModel.manufacturer',
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

    private function updateSpecific(Device $device, Request $request): void
    {
        match ($device->category) {
            'computer' => $device->computer?->update(
                $request->only(['cpu', 'ram', 'imei', 'phone_number'])
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