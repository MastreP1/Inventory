<?php

namespace App\Http\Controllers;
use Illuminate\Routing\Controller;
use App\Models\DeviceLog;

class DeviceLogController extends Controller
{
    /**
     * GET /logs
     * All logs across all devices, newest first.
     */
    public function index()
    {
        return DeviceLog::with('device')
            ->latest('logged_at')
            ->get();
    }

    /**
     * GET /devices/:id/logs
     * All logs for a specific device.
     */
    public function deviceLogs($id)
    {
        return DeviceLog::where('device_id', $id)
            ->latest('logged_at')
            ->get();
    }
}
