<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HardDrive extends Model
{
    protected $fillable = [
        'device_id',
        'drive_type',
        'capacity_gb',
    ];

    protected $casts = [
        'capacity_gb' => 'integer',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * The computer this drive is currently installed in (active assignment).
     */
    public function currentComputer()
    {
        return $this->hasOneThrough(
            Device::class,
            HardDriveAssignment::class,
            'hard_drive_id', // FK on hard_drive_assignments
            'id',            // FK on devices
            'device_id',     // local key on hard_drives
            'computer_id'    // local key on hard_drive_assignments
        )->whereNull('hard_drive_assignments.end_date');
    }

    /**
     * Full assignment history — every computer this drive has been in.
     */
    public function assignmentHistory()
    {
        return $this->hasMany(HardDriveAssignment::class, 'hard_drive_id', 'device_id');
    }
}
