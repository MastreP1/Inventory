<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    protected $fillable = ['name', 'is_assignable'];

    protected $casts = [
        'is_assignable' => 'boolean',
    ];

    public function devices()
    {
        return $this->hasMany(Device::class);
    }
}
