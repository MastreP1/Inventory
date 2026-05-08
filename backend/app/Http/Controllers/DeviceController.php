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
    private const STOCK_STATUSES = ['reserved','instock/new','instock/used'];

    public function __construct(protected DeviceLogService $logger) {}

    public function index(Request $request)
    {
        // SoftDeletes global scope automatically excludes deleted devices.
        // Only active (non-deleted) devices are returned here.
        $query = Device::with([
            'deviceType','manufacturer','deviceModel.manufacturer',
            'location.site','department','user',
            'status','driveStatus','cartridgeStatus',
            'computer','printer','monitor','hardDrive','cartridge',
        ]);
        if ($request->filled('category')) {
            $query->whereIn('category', explode(',', $request->category));
        }
        if ($request->filled('department_id')) $query->where('department_id', $request->department_id);
        if ($request->filled('location_id'))   $query->where('location_id',   $request->location_id);
        if ($request->filled('user_id'))        $query->where('user_id',        $request->user_id);
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(fn($s) => $s->where('label','like',"%{$q}%")->orWhere('serial_number','like',"%{$q}%"));
        }
        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $base = $request->validate([
            // Unique rules use whereNull('deleted_at') so a soft-deleted device's
            // label/serial doesn't block re-creation of a new device with the same name.
            'label'               => 'required|string|unique:devices,label,NULL,id,deleted_at,NULL',
            'serial_number'       => 'required|string|unique:devices,serial_number,NULL,id,deleted_at,NULL',
            'device_type_id'      => 'required|exists:device_types,id',
            'manufacturer_id'     => 'nullable|exists:manufacturers,id',
            'device_model_id'     => 'required|exists:device_models,id',
            'location_id'         => 'nullable|exists:locations,id',
            'comment'             => 'nullable|string',
            'status_id'           => 'nullable|exists:statuses,id',
            'drive_status_id'     => 'nullable|exists:drive_statuses,id',
            'cartridge_status_id' => 'nullable|exists:cartridge_statuses,id',
        ]);

        $deviceType = DeviceType::findOrFail($base['device_type_id']);
        $category   = $deviceType->category;

        // Auto-assign manufacturer from model
        if (empty($base['manufacturer_id']) && !empty($base['device_model_id'])) {
            $m = DeviceModel::find($base['device_model_id']);
            if ($m?->manufacturer_id) $base['manufacturer_id'] = $m->manufacturer_id;
        }

        $specific = match ($category) {
            'computer'   => $request->validate(['cpu'=>'nullable|string','ram'=>'nullable|string','imei'=>'nullable|string','phone_number'=>'nullable|string']),
            'printer'    => $request->validate(['printer_type'=>'required|in:laser,inkjet','duplex'=>'boolean','color_support'=>'boolean']),
            'monitor'    => $request->validate(['panel_type'=>'nullable|in:IPS,TN,VA,OLED','size_inches'=>'nullable|numeric|min:1|max:100','video_inputs'=>'nullable|array','video_inputs.*'=>'string|in:HDMI,DisplayPort,VGA,DVI,USB-C']),
            'hard_drive' => $request->validate(['drive_type'=>'required|in:HDD,SSD,NVMe','capacity_gb'=>'required|integer|min:1']),
            'cartridge'  => $request->validate(['ink_type'=>'required|in:laser,inkjet','printer_compatibility'=>'required|string']),
            default      => [],
        };

        return DB::transaction(function () use ($base, $specific, $category, $deviceType) {
            $this->applyDefaultStatus($base, $category);
            $this->applyAutoStockLocation($base, $category);

            $device = Device::create(array_merge($base, ['category' => $category]));

            match ($category) {
                'computer'   => Computer::create(array_merge(['device_id'=>$device->id], $specific)),
                'printer'    => Printer::create(array_merge(['device_id'=>$device->id], $specific)),
                'monitor'    => Monitor::create(array_merge(['device_id'=>$device->id], $specific)),
                'hard_drive' => HardDrive::create(array_merge(['device_id'=>$device->id], $specific)),
                'cartridge'  => Cartridge::create(array_merge(['device_id'=>$device->id], $specific)),
                default      => null,
            };

            // Log device creation — this entry is permanent and survives soft delete
            $this->logger->log($device->id, 'device_created', [
                'label'       => $device->label,
                'serial'      => $device->serial_number,
                'category'    => $category,
                'device_type' => $deviceType->name,
                'location_id' => $device->location_id,
            ]);

            return response()->json($device->fresh()->load($this->withRelations($category)), 201);
        });
    }

    public function show($id)
    {
        // withTrashed() allows viewing a soft-deleted device's full history if needed.
        // Normally this won't be accessed for deleted devices, but it's safe to include.
        return Device::withTrashed()->with([
            'deviceType','manufacturer','deviceModel.manufacturer',
            'location.site','department','user',
            'status','driveStatus','cartridgeStatus',
            'computer','printer','monitor','hardDrive','cartridge',
            'assignments.user','movements.fromLocation','movements.toLocation','logs',
        ])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $device = Device::findOrFail($id);

        $base = $request->validate([
            // Exclude current device ID from uniqueness check (standard update rule),
            // AND also only check among non-deleted rows.
            'label'           => 'sometimes|string|unique:devices,label,'.$id.',id,deleted_at,NULL',
            'serial_number'   => 'nullable|string|unique:devices,serial_number,'.$id.',id,deleted_at,NULL',
            'manufacturer_id' => 'nullable|exists:manufacturers,id',
            'device_model_id' => 'nullable|exists:device_models,id',
            'location_id'     => 'nullable|exists:locations,id',
            'user_id'         => 'nullable|exists:users,id',
            'comment'         => 'nullable|string',
        ]);

        if (!empty($base['device_model_id'])) {
            $m = DeviceModel::find($base['device_model_id']);
            if ($m?->manufacturer_id && empty($base['manufacturer_id'])) {
                $base['manufacturer_id'] = $m->manufacturer_id;
            }
        }

        $statusField = $device->getStatusFkName();
        $statusRules = match ($device->category) {
            'hard_drive' => ['drive_status_id'     => 'sometimes|exists:drive_statuses,id'],
            'cartridge'  => ['cartridge_status_id' => 'sometimes|exists:cartridge_statuses,id'],
            default      => ['status_id'           => 'sometimes|exists:statuses,id'],
        };
        $statusData = $request->validate($statusRules);

        return DB::transaction(function () use ($device, $base, $statusData, $statusField) {
            $statusChanged = isset($statusData[$statusField]) && $statusData[$statusField] != $device->$statusField;

            if ($statusChanged) {
                $oldStatus     = $device->getEffectiveStatus()?->name ?? 'none';
                $newStatusName = $this->resolveStatusName($device->category, $statusData[$statusField]);

                $device->update(array_merge($base, $statusData));
                $newStatus = $device->fresh()->getEffectiveStatus()?->name ?? 'none';

                // Log status change exactly once — never duplicated
                $this->logger->logStatusChange($device->id, $oldStatus, $newStatus);

                if ($this->isStockStatus($newStatusName)) {
                    $this->applyStockRelocation($device);
                }
            } else {
                $device->update(array_merge($base, $statusData));
            }

            $this->updateSpecific($device, request());
            return response()->json($device->fresh()->load($this->withRelations($device->category)));
        });
    }

    /**
     * Soft-delete the device.
     *
     * IMPORTANT: this is a SOFT delete — the DB row is NOT removed.
     * deleted_at is set to now(), which:
     *   • Removes the device from all normal queries (index, assignments, etc.)
     *   • Preserves every log entry (device_created, assigned, moved, status_changed…)
     *     because the device_logs FK cascade only fires on hard DELETE, which never happens.
     *   • Logs a final device_deleted entry so the audit trail is complete.
     *
     * The device's label, serial, and category are embedded in the log's details
     * so the log is self-contained even if the device row is later purged manually.
     */
    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $device = Device::with(['deviceType'])->findOrFail($id);

            // 1. Write the deletion log BEFORE soft-deleting so device_id is still valid.
            $this->logger->log($device->id, 'device_deleted', [
                'label'       => $device->label,
                'serial'      => $device->serial_number,
                'category'    => $device->category,
                'device_type' => $device->deviceType?->name,
                'deleted_at'  => now()->toISOString(),
            ]);

            // 2. Soft-delete: sets deleted_at, does NOT trigger the FK cascade on device_logs.
            $device->delete();

            return response()->json([
                'message' => "Device [{$device->label}] has been decommissioned. All logs and history are preserved.",
            ]);
        });
    }

    /* ── helpers ─────────────────────────────────────────────────────── */

    private function resolveStatusName(string $category, $id): string
    {
        return match ($category) {
            'hard_drive' => \App\Models\DriveStatus::find($id)?->name ?? '',
            'cartridge'  => \App\Models\CartridgeStatus::find($id)?->name ?? '',
            default      => \App\Models\Status::find($id)?->name ?? '',
        };
    }

    private function isStockStatus(string $name): bool
    {
        return in_array(strtolower($name), self::STOCK_STATUSES, true);
    }

    private function findStockLocation(): ?Location
    {
        return Location::where('name', 'Stock')->first();
    }

    private function applyStockRelocation(Device $device): void
    {
        $stock   = $this->findStockLocation();
        $updates = ['user_id' => null];
        if ($stock) $updates['location_id'] = $stock->id;

        $oldLoc  = $device->location_id;
        $oldUser = $device->user_id;
        $device->update($updates);

        $this->logger->log($device->id, 'auto_stock_relocation', [
            'from_location_id' => $oldLoc,
            'to_location_id'   => $stock?->id,
            'cleared_user_id'  => $oldUser,
            'reason'           => 'status_changed_to_stock',
        ]);
    }

    private function applyAutoStockLocation(array &$base, string $category): void
    {
        $statusId = match ($category) {
            'hard_drive' => $base['drive_status_id']     ?? null,
            'cartridge'  => $base['cartridge_status_id'] ?? null,
            default      => $base['status_id']           ?? null,
        };
        if (!$statusId) return;
        if (!$this->isStockStatus($this->resolveStatusName($category, $statusId))) return;
        if (!empty($base['location_id'])) return;

        $stock = $this->findStockLocation();
        if ($stock) $base['location_id'] = $stock->id;
    }

    private function applyDefaultStatus(array &$base, string $category): void
    {
        match ($category) {
            'hard_drive' => $base['drive_status_id']     ??= \App\Models\DriveStatus::where('name','InStock/New')->first()?->id,
            'cartridge'  => $base['cartridge_status_id'] ??= \App\Models\CartridgeStatus::where('name','Full')->first()?->id,
            default      => $base['status_id']           ??= \App\Models\Status::where('name','Reserved')->first()?->id,
        };
    }

    private function withRelations(string $category): array
    {
        return array_merge(
            ['deviceType','manufacturer','deviceModel.manufacturer','location.site','department','status','driveStatus','cartridgeStatus'],
            match ($category) {
                'computer'   => ['computer','user'],
                'printer'    => ['printer'],
                'monitor'    => ['monitor','user'],
                'hard_drive' => ['hardDrive'],
                'cartridge'  => ['cartridge'],
                default      => [],
            }
        );
    }

    private function updateSpecific(Device $device, Request $request): void
    {
        match ($device->category) {
            'computer'   => $device->computer?->update($request->only(['cpu','ram','imei','phone_number'])),
            'printer'    => $device->printer?->update($request->only(['printer_type','duplex','color_support'])),
            'monitor'    => $device->monitor?->update($request->only(['panel_type','size_inches','video_inputs'])),
            'hard_drive' => $device->hardDrive?->update($request->only(['drive_type','capacity_gb'])),
            'cartridge'  => $device->cartridge?->update($request->only(['ink_type','printer_compatibility'])),
            default      => null,
        };
    }
}