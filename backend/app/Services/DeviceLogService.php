<?php

namespace App\Services;

use App\Models\DeviceLog;

class DeviceLogService
{
    /**
     * Write an audit log entry for any device-related action.
     *
     * @param int        $deviceId  The device this event is about
     * @param string     $action    Action string (see list below)
     * @param array|null $details   Plain PHP array — Eloquent cast handles JSON encoding.
     *                              NEVER json_encode() before passing.
     *
     * Supported actions:
     *   Device lifecycle:
     *     status_changed           — manual status change
     *     auto_stock_relocation    — auto-moved to Stock when status → Reserved/InStock
     *   User assignments:
     *     assigned, unassigned
     *   Movements:
     *     moved
     *   Location swaps:
     *     location_swapped
     *   Owner swaps:
     *     owner_swapped
     *   Drive ops:
     *     drive_assigned, drive_unassigned, drive_swapped
     *   Cartridge ops:
     *     cartridge_assigned, cartridge_unassigned, cartridge_swapped
     */
    public function log(int $deviceId, string $action, ?array $details = null): void
    {
        DeviceLog::create([
            'device_id' => $deviceId,
            'action'    => $action,
            'details'   => $details,
            'logged_at' => now(),
        ]);
    }

    /**
     * Log a status change event.
     * Only called when status is changed manually — NOT when changed
     * as a side-effect of an assignment (those have their own log entries).
     */
    public function logStatusChange(int $deviceId, string $fromStatus, string $toStatus): void
    {
        $this->log($deviceId, 'status_changed', [
            'from' => $fromStatus,
            'to'   => $toStatus,
        ]);
    }
}