<?php

namespace App\Services;

use App\Models\DeviceLog;

class DeviceLogService
{
    /**
     * Supported action strings:
     *
     *   Device lifecycle:
     *     device_created           — device registered in the system
     *     device_deleted           — device removed from the system
     *     status_changed           — manual status change (NOT triggered by assignment side-effects)
     *     auto_stock_relocation    — auto-moved to Stock + user cleared when status → Reserved/InStock/*
     *
     *   User assignments:
     *     assigned, unassigned
     *
     *   Movements:
     *     moved
     *
     *   Swaps:
     *     location_swapped, owner_swapped
     *
     *   Drive (Disque) ops:
     *     drive_assigned, drive_unassigned, drive_swapped
     *
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

    public function logStatusChange(int $deviceId, string $fromStatus, string $toStatus): void
    {
        $this->log($deviceId, 'status_changed', [
            'from' => $fromStatus,
            'to'   => $toStatus,
        ]);
    }
}