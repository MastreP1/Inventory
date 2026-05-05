<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceSwap;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceSwapController extends Controller
{
    public function __construct(protected DeviceLogService $logger) {}

    public function index()
    {
        return DeviceSwap::with([
            'deviceA', 'deviceB',
            'locationA.site', 'locationB.site',
        ])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'device_a_id' => 'required|exists:devices,id|different:device_b_id',
            'device_b_id' => 'required|exists:devices,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $a = Device::findOrFail($validated['device_a_id']);
            $b = Device::findOrFail($validated['device_b_id']);

            $locA = $a->location_id;
            $locB = $b->location_id;

            $a->update(['location_id' => $locB]);
            $b->update(['location_id' => $locA]);

            $swap = DeviceSwap::create([
                'device_a_id'   => $a->id,
                'device_b_id'   => $b->id,
                'location_a_id' => $locA,
                'location_b_id' => $locB,
                'swapped_at'    => now(),
            ]);

            $this->logger->log($a->id, 'location_swapped', [
                'with_device_id'    => $b->id,
                'with_device_label' => $b->label,
                'old_location_id'   => $locA,
                'new_location_id'   => $locB,
            ]);
            $this->logger->log($b->id, 'location_swapped', [
                'with_device_id'    => $a->id,
                'with_device_label' => $a->label,
                'old_location_id'   => $locB,
                'new_location_id'   => $locA,
            ]);

            return response()->json(
                $swap->load(['deviceA', 'deviceB', 'locationA.site', 'locationB.site']),
                201
            );
        });
    }

    public function destroy($id)
    {
        DeviceSwap::findOrFail($id)->delete();
        return response()->json(['message' => 'Swap record deleted.']);
    }

    public function deviceSwaps($id)
    {
        return DeviceSwap::where('device_a_id', $id)
            ->orWhere('device_b_id', $id)
            ->with(['deviceA', 'deviceB', 'locationA.site', 'locationB.site'])
            ->latest()->get();
    }
}
