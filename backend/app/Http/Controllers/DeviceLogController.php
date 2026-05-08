<?php

namespace App\Http\Controllers;
use Illuminate\Routing\Controller;
use App\Models\DeviceLog;
use App\Models\Device;

class DeviceLogController extends Controller
{
    /**
     * GET /logs
     * All logs across all devices, newest first.
     *
     * The device() relation on DeviceLog uses withTrashed(), so soft-deleted
     * devices still appear with their label in the log response.
     * A soft-deleted device is identifiable by device.deleted_at being non-null.
     */
    public function index()
    {
        return DeviceLog::with('device')
            ->latest('logged_at')
            ->get();
    }

    /**
     * GET /devices/:id/logs
     * All logs for a specific device — including soft-deleted devices.
     *
     * We use withTrashed() on the Device query so that requesting logs for a
     * decommissioned device still works (e.g. from an audit report that stored
     * the device ID before it was deleted).
     */
    public function deviceLogs($id)
    {
        // Resolve the device including soft-deleted ones
        $device = Device::withTrashed()->findOrFail($id);

        return DeviceLog::where('device_id', $device->id)
            ->latest('logged_at')
            ->get();
    }
}