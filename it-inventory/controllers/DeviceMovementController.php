<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceMovement;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;

class DeviceMovementController extends Controller
{
    public function __construct(protected DeviceLogService $logger) {}

    public function index()
    {
        return DeviceMovement::with(['device', 'fromLocation.site', 'toLocation.site'])
            ->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'device_id'      => 'required|exists:devices,id',
            'to_location_id' => 'required|exists:locations,id',
        ]);

        $device = Device::findOrFail($validated['device_id']);

        $movement = DeviceMovement::create([
            'device_id'        => $device->id,
            'from_location_id' => $device->location_id,
            'to_location_id'   => $validated['to_location_id'],
            'moved_at'         => now(),
        ]);

        $device->update(['location_id' => $validated['to_location_id']]);

        $this->logger->log($device->id, 'moved', [
            'from_location_id' => $movement->from_location_id,
            'to_location_id'   => $movement->to_location_id,
        ]);

        return response()->json(
            $movement->load(['device', 'fromLocation.site', 'toLocation.site']),
            201
        );
    }

    /**
     * DELETE /movements/:id
     * Hard delete of a movement record.
     * Does NOT reverse the device's location — use a new movement for that.
     */
    public function destroy($id)
    {
        DeviceMovement::findOrFail($id)->delete();
        return response()->json(['message' => 'Movement record deleted.']);
    }

    public function deviceMovements($id)
    {
        return DeviceMovement::where('device_id', $id)
            ->with(['fromLocation.site', 'toLocation.site'])
            ->latest()->get();
    }
}
