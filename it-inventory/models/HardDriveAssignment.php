<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HardDriveAssignment extends Model
{
    protected $table = 'hard_drive_assignments';

    protected $fillable = [
        'hard_drive_id',
        'computer_id',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date'   => 'datetime',
    ];

    /**
     * The hard drive device record.
     */
    public function hardDrive()
    {
        return $this->belongsTo(Device::class, 'hard_drive_id');
    }

    /**
     * The computer device record.
     */
    public function computer()
    {
        return $this->belongsTo(Device::class, 'computer_id');
    }
}
