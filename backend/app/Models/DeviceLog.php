<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceLog extends Model
{
    protected $table = 'device_logs';

    protected $fillable = [
        'device_id',
        'action',
        'details',
        'logged_at',
    ];

    protected $casts = [
        // Eloquent auto-encodes/decodes. NEVER manually json_encode() before passing.
        'details'   => 'array',
        'logged_at' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
