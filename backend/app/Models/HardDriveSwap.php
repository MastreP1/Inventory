<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HardDriveSwap extends Model
{
    protected $table = 'hard_drive_swaps';

    protected $fillable = [
        'computer_a_id',
        'computer_b_id',
        'drive_a_id',
        'drive_b_id',
        'swapped_at',
    ];

    protected $casts = [
        'swapped_at' => 'datetime',
    ];

    public function computerA()
    {
        return $this->belongsTo(Device::class, 'computer_a_id');
    }

    public function computerB()
    {
        return $this->belongsTo(Device::class, 'computer_b_id');
    }

    public function driveA()
    {
        return $this->belongsTo(Device::class, 'drive_a_id');
    }

    public function driveB()
    {
        return $this->belongsTo(Device::class, 'drive_b_id');
    }
}
