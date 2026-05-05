<?php

namespace App\Http\Controllers;
use Illuminate\Routing\Controller;
use App\Models\Device;
use App\Models\DeviceOwnerSwap;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceOwnerSwapController extends Controller
{
    public function __construct(protected DeviceLogService $logger) {}

    public function index()
    {
        return DeviceOwnerSwap::with(['deviceA', 'deviceB', 'userA', 'userB'])
            ->latest()->get();
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

            $userA = $a->user_id;
            $userB = $b->user_id;

            $a->update(['user_id' => $userB]);
            $b->update(['user_id' => $userA]);

            $swap = DeviceOwnerSwap::create([
                'device_a_id' => $a->id,
                'device_b_id' => $b->id,
                'user_a_id'   => $userA,
                'user_b_id'   => $userB,
                'swapped_at'  => now(),
            ]);

            $this->logger->log($a->id, 'owner_swapped', [
                'with_device_id'    => $b->id,
                'with_device_label' => $b->label,
                'old_user_id'       => $userA,
                'new_user_id'       => $userB,
            ]);
            $this->logger->log($b->id, 'owner_swapped', [
                'with_device_id'    => $a->id,
                'with_device_label' => $a->label,
                'old_user_id'       => $userB,
                'new_user_id'       => $userA,
            ]);

            return response()->json(
                $swap->load(['deviceA', 'deviceB', 'userA', 'userB']),
                201
            );
        });
    }

    public function destroy($id)
    {
        DeviceOwnerSwap::findOrFail($id)->delete();
        return response()->json(['message' => 'Owner swap record deleted.']);
    }

    public function deviceOwnerSwaps($id)
    {
        return DeviceOwnerSwap::where('device_a_id', $id)
            ->orWhere('device_b_id', $id)
            ->with(['deviceA', 'deviceB', 'userA', 'userB'])
            ->latest()->get();
    }
}
