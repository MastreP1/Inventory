<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Device extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'label', 'serial_number', 'device_type_id', 'category',
        'manufacturer_id', 'device_model_id', 'location_id', 'department_id',
        'user_id', 'status_id', 'drive_status_id', 'cartridge_status_id', 'comment',
    ];

    /**
     * SoftDeletes adds `deleted_at` to the dates array automatically.
     * All normal queries (index, show, assignments …) automatically exclude
     * soft-deleted rows via Eloquent's global scope.
     *
     * To query including deleted:  Device::withTrashed()->…
     * To query only deleted:       Device::onlyTrashed()->…
     * To restore:                  $device->restore()
     */

    /* ─── Classification ───────────────────────────────────────────────── */

    public function deviceType()
    {
        return $this->belongsTo(DeviceType::class);
    }

    public function manufacturer()
    {
        return $this->belongsTo(Manufacturer::class);
    }

    /**
     * Eager-load manufacturer through model so the frontend always gets
     * manufacturer data even when manufacturer_id is set via model.
     */
    public function deviceModel()
    {
        return $this->belongsTo(DeviceModel::class, 'device_model_id')
                    ->with('manufacturer');
    }

    /* ─── Statuses ─────────────────────────────────────────────────────── */

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function driveStatus()
    {
        return $this->belongsTo(DriveStatus::class, 'drive_status_id');
    }

    public function cartridgeStatus()
    {
        return $this->belongsTo(CartridgeStatus::class, 'cartridge_status_id');
    }

    /* ─── Location & Organisation ─────────────────────────────────────── */

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /* ─── User Assignment ─────────────────────────────────────────────── */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /* ─── Specialised Type Details ────────────────────────────────────── */

    public function computer()
    {
        return $this->hasOne(Computer::class);
    }

    public function printer()
    {
        return $this->hasOne(Printer::class);
    }

    public function monitor()
    {
        return $this->hasOne(Monitor::class);
    }

    public function hardDrive()
    {
        return $this->hasOne(HardDrive::class);
    }

    public function cartridge()
    {
        return $this->hasOne(Cartridge::class);
    }

    /* ─── Assignment History ──────────────────────────────────────────── */

    public function assignments()
    {
        return $this->hasMany(DeviceAssignment::class);
    }

    public function hardDriveAssignments()
    {
        return $this->hasMany(HardDriveAssignment::class, 'computer_id');
    }

    public function computerAssignments()
    {
        return $this->hasMany(HardDriveAssignment::class, 'hard_drive_id');
    }

    public function cartridgeAssignments()
    {
        return $this->hasMany(CartridgeAssignment::class, 'printer_id');
    }

    public function printerAssignments()
    {
        return $this->hasMany(CartridgeAssignment::class, 'cartridge_id');
    }

    /* ─── Movement & Swap History ─────────────────────────────────────── */

    public function movements()
    {
        return $this->hasMany(DeviceMovement::class);
    }

    public function logs()
    {
        return $this->hasMany(DeviceLog::class);
    }

    public function swapsAsA()
    {
        return $this->hasMany(DeviceSwap::class, 'device_a_id');
    }

    public function swapsAsB()
    {
        return $this->hasMany(DeviceSwap::class, 'device_b_id');
    }

    public function ownerSwapsAsA()
    {
        return $this->hasMany(DeviceOwnerSwap::class, 'device_a_id');
    }

    public function ownerSwapsAsB()
    {
        return $this->hasMany(DeviceOwnerSwap::class, 'device_b_id');
    }

    /* ─── Helpers ─────────────────────────────────────────────────────── */

    public function getEffectiveStatus(): ?Model
    {
        return match ($this->category) {
            'hard_drive' => $this->driveStatus,
            'cartridge'  => $this->cartridgeStatus,
            default      => $this->status,
        };
    }

    public function getStatusFkName(): string
    {
        return match ($this->category) {
            'hard_drive' => 'drive_status_id',
            'cartridge'  => 'cartridge_status_id',
            default      => 'status_id',
        };
    }

    /**
     * Returns the display category used for uniqueness rule enforcement.
     * Phones (category=computer, type=Phone) → 'mobile'
     */
    public function getDisplayCategory(): string
    {
        if ($this->category === 'computer' && $this->deviceType?->name === 'Phone') {
            return 'mobile';
        }
        return $this->category;
    }

    /**
     * Whether this device has been soft-deleted.
     */
    public function isDeleted(): bool
    {
        return $this->deleted_at !== null;
    }
}