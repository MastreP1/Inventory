<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceOwnerSwap extends Model
{
    protected $table = 'device_owner_swaps';

    protected $fillable = [
        'device_a_id',
        'device_b_id',
        'user_a_id',
        'user_b_id',
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

    public function userA()
    {
        return $this->belongsTo(User::class, 'user_a_id');
    }

    public function userB()
    {
        return $this->belongsTo(User::class, 'user_b_id');
    }
}
