<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Computer extends Model
{
    protected $fillable = [
        'device_id',
        'cpu',
        'ram',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Currently installed hard drives in this computer.
     * A computer can have multiple drives.
     */
    public function installedDrives()
    {
        return $this->hasManyThrough(
            Device::class,
            HardDriveAssignment::class,
            'computer_id',   // FK on hard_drive_assignments
            'id',            // FK on devices
            'device_id',     // local key on computers
            'hard_drive_id'  // local key on hard_drive_assignments
        )->whereNull('hard_drive_assignments.end_date');
    }
}
