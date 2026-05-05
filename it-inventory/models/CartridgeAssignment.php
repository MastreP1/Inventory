<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartridgeAssignment extends Model
{
    protected $table = 'cartridge_assignments';

    protected $fillable = [
        'cartridge_id',
        'printer_id',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date'   => 'datetime',
    ];

    public function cartridge()
    {
        return $this->belongsTo(Device::class, 'cartridge_id');
    }

    public function printer()
    {
        return $this->belongsTo(Device::class, 'printer_id');
    }
}
