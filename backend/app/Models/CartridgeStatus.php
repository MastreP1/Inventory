<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartridgeStatus extends Model
{
    protected $fillable = ['name', 'is_assignable'];

    protected $casts = [
        'is_assignable' => 'boolean',
    ];

    public function cartridges()
    {
        return $this->hasMany(Device::class, 'cartridge_status_id');
    }
}
