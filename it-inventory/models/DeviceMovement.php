<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceMovement extends Model
{
    protected $table = 'device_movements';

    protected $fillable = [
        'device_id',
        'from_location_id',
        'to_location_id',
        'moved_at',
    ];

    protected $casts = [
        'moved_at' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function fromLocation()
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function toLocation()
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }
}
