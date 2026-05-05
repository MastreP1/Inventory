<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cartridge extends Model
{
    protected $fillable = [
        'device_id',
        'ink_type',
        'printer_compatibility',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * The printer this cartridge is currently installed in (active assignment).
     */
    public function currentPrinter()
    {
        return $this->hasOneThrough(
            Device::class,
            CartridgeAssignment::class,
            'cartridge_id', // FK on cartridge_assignments
            'id',           // FK on devices
            'device_id',    // local key on cartridges
            'printer_id'    // local key on cartridge_assignments
        )->whereNull('cartridge_assignments.end_date');
    }

    /**
     * Full assignment history — every printer this cartridge has been in.
     */
    public function assignmentHistory()
    {
        return $this->hasMany(CartridgeAssignment::class, 'cartridge_id', 'device_id');
    }
}
