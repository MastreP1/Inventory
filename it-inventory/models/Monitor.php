<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Monitor extends Model
{
    protected $fillable = [
        'device_id',
        'panel_type',
        'size_inches',
        'video_inputs',
    ];

    protected $casts = [
        'video_inputs' => 'array',
        'size_inches'  => 'decimal:1',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
