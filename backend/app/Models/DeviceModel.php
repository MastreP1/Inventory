<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceModel extends Model
{
    protected $table = 'device_models';

    protected $fillable = [
        'manufacturer_id',
        'device_type_id',
        'name',
    ];

    /**
     * The $with property ensures manufacturer is always eager-loaded
     * when a DeviceModel is fetched, so API responses always include it.
     * This prevents N+1 and ensures the frontend can auto-fill manufacturer.
     */
    protected $with = ['manufacturer'];

    public function manufacturer()
    {
        return $this->belongsTo(Manufacturer::class);
    }

    public function deviceType()
    {
        return $this->belongsTo(DeviceType::class);
    }

    public function devices()
    {
        return $this->hasMany(Device::class, 'device_model_id');
    }
}