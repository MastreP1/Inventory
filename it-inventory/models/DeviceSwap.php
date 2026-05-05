<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceSwap extends Model
{
    protected $table = 'device_swaps';

    protected $fillable = [
        'device_a_id',
        'device_b_id',
        'location_a_id',
        'location_b_id',
        'swapped_at',
    ];

    protected $casts = [
        'swapped_at' => 'datetime',
    ];

    public function deviceA()
    {
        return $this->belongsTo(Device::class, 'device_a_id');
    }

    public function deviceB()
    {
        return $this->belongsTo(Device::class, 'device_b_id');
    }

    public function locationA()
    {
        return $this->belongsTo(Location::class, 'location_a_id');
    }

    public function locationB()
    {
        return $this->belongsTo(Location::class, 'location_b_id');
    }
}
