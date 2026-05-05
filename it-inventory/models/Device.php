<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = [
        'label',
        'serial_number',
        'device_type_id',
        'category',
        'manufacturer_id',
        'device_model_id',
        'location_id',
        'department_id',
        'user_id',
        'status_id',
        'drive_status_id',
        'cartridge_status_id',
        'comment',
    ];

    /* ─────────────────────────────────────────
     |  CLASSIFICATION
    ───────────────────────────────────────── */

    public function deviceType()
    {
        return $this->belongsTo(DeviceType::class);
    }

    public function manufacturer()
    {
        return $this->belongsTo(Manufacturer::class);
    }

    public function deviceModel()
    {
        return $this->belongsTo(DeviceModel::class, 'device_model_id');
    }

    /* ─────────────────────────────────────────
     |  STATUSES (only one will be populated)
    ───────────────────────────────────────── */

    /** For computers / printers / monitors */
    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    /** For hard drives */
    public function driveStatus()
    {
        return $this->belongsTo(DriveStatus::class, 'drive_status_id');
    }

    /** For cartridges */
    public function cartridgeStatus()
    {
        return $this->belongsTo(CartridgeStatus::class, 'cartridge_status_id');
    }

    /* ─────────────────────────────────────────
     |  LOCATION & ORGANISATION
    ───────────────────────────────────────── */

    /**
     * Physical location. Site is derived via location->site.
     * The frontend never sets site_id directly.
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /* ─────────────────────────────────────────
     |  USER ASSIGNMENT (computers / monitors)
    ───────────────────────────────────────── */

    /** Current user holding this device. Null if unassigned. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /* ─────────────────────────────────────────
     |  SPECIALIZED TYPE DETAILS (one will match based on category)
    ───────────────────────────────────────── */

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

    /* ─────────────────────────────────────────
     |  ASSIGNMENT HISTORY
    ───────────────────────────────────────── */

    /** User assignment history (computers / printers / monitors) */
    public function assignments()
    {
        return $this->hasMany(DeviceAssignment::class);
    }

    /** Hard drive installation history (when this device IS a computer) */
    public function hardDriveAssignments()
    {
        return $this->hasMany(HardDriveAssignment::class, 'computer_id');
    }

    /** History of which computers this drive has been installed in (when this device IS a hard drive) */
    public function computerAssignments()
    {
        return $this->hasMany(HardDriveAssignment::class, 'hard_drive_id');
    }

    /** Cartridge installation history (when this device IS a printer) */
    public function cartridgeAssignments()
    {
        return $this->hasMany(CartridgeAssignment::class, 'printer_id');
    }

    /** History of which printers this cartridge has been installed in (when this device IS a cartridge) */
    public function printerAssignments()
    {
        return $this->hasMany(CartridgeAssignment::class, 'cartridge_id');
    }

    /* ─────────────────────────────────────────
     |  MOVEMENT & SWAP HISTORY
    ───────────────────────────────────────── */

    public function movements()
    {
        return $this->hasMany(DeviceMovement::class);
    }

    public function logs()
    {
        return $this->hasMany(DeviceLog::class);
    }

    /**
     * Location swap history — device appears as either side A or B.
     * Using a scope-style union approach via two relations.
     */
    public function swapsAsA()
    {
        return $this->hasMany(DeviceSwap::class, 'device_a_id');
    }

    public function swapsAsB()
    {
        return $this->hasMany(DeviceSwap::class, 'device_b_id');
    }

    /**
     * Owner swap history — device appears as either side A or B.
     */
    public function ownerSwapsAsA()
    {
        return $this->hasMany(DeviceOwnerSwap::class, 'device_a_id');
    }

    public function ownerSwapsAsB()
    {
        return $this->hasMany(DeviceOwnerSwap::class, 'device_b_id');
    }

    /* ─────────────────────────────────────────
     |  HELPERS
    ───────────────────────────────────────── */

    /**
     * Returns whichever status relation is relevant for this device's category.
     * Useful for generic status checks in services.
     */
    public function getEffectiveStatus(): ?Model
    {
        return match ($this->category) {
            'hard_drive' => $this->driveStatus,
            'cartridge'  => $this->cartridgeStatus,
            default      => $this->status,
        };
    }

    /**
     * Returns the relevant status FK name for this device's category.
     */
    public function getStatusFkName(): string
    {
        return match ($this->category) {
            'hard_drive' => 'drive_status_id',
            'cartridge'  => 'cartridge_status_id',
            default      => 'status_id',
        };
    }
}
