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

    /**
     * The device that owns this log entry.
     *
     * withTrashed() is critical here: soft-deleted devices must still be
     * reachable via their logs. Without it, `$log->device` would return null
     * for any log belonging to a decommissioned device, making the audit trail
     * appear broken even though all data is intact.
     *
     * The device row is never hard-deleted, so this always resolves correctly.
     */
    public function device()
    {
        return $this->belongsTo(Device::class)->withTrashed();
    }
}