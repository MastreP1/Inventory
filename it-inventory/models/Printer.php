<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Printer extends Model
{
    protected $fillable = [
        'device_id',
        'printer_type',
        'duplex',
        'color_support',
    ];

    protected $casts = [
        'duplex'        => 'boolean',
        'color_support' => 'boolean',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Currently installed cartridge in this printer.
     * A printer has at most one active cartridge at a time.
     */
    public function currentCartridge()
    {
        return $this->hasOneThrough(
            Device::class,
            CartridgeAssignment::class,
            'printer_id',    // FK on cartridge_assignments
            'id',            // FK on devices
            'device_id',     // local key on printers
            'cartridge_id'   // local key on cartridge_assignments
        )->whereNull('cartridge_assignments.end_date');
    }
}
