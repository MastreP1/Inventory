<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartridgeSwap extends Model
{
    protected $table = 'cartridge_swaps';

    protected $fillable = [
        'printer_id',
        'old_cartridge_id',
        'new_cartridge_id',
        'swapped_at',
    ];

    protected $casts = [
        'swapped_at' => 'datetime',
    ];

    public function printer()
    {
        return $this->belongsTo(Device::class, 'printer_id');
    }

    public function oldCartridge()
    {
        return $this->belongsTo(Device::class, 'old_cartridge_id');
    }

    public function newCartridge()
    {
        return $this->belongsTo(Device::class, 'new_cartridge_id');
    }
}
