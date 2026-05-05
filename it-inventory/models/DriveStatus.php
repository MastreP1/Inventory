<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriveStatus extends Model
{
    protected $fillable = ['name', 'is_assignable'];

    protected $casts = [
        'is_assignable' => 'boolean',
    ];

    public function hardDrives()
    {
        return $this->hasMany(Device::class, 'drive_status_id');
    }
}
