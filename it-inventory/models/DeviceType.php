<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceType extends Model
{
    protected $fillable = ['name', 'category'];

    /**
     * Category is the internal discriminator:
     * computer / printer / monitor / hard_drive / cartridge
     *
     * Multiple device types can share the same category:
     *   "Laptop"     → computer
     *   "Mini Tower" → computer
     *   "Server"     → computer
     *   "Tower"      → computer
     *   "Phone"      → computer
     *   "Printer"    → printer
     *   "Monitor"    → monitor
     *   "Hard Drive" → hard_drive
     *   "Cartridge"  → cartridge
     */
    public function deviceModels()
    {
        return $this->hasMany(DeviceModel::class);
    }

    public function devices()
    {
        return $this->hasMany(Device::class);
    }
}
