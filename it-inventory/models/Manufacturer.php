<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Manufacturer extends Model
{
    protected $fillable = ['name'];

    public function deviceModels()
    {
        return $this->hasMany(DeviceModel::class);
    }
}
