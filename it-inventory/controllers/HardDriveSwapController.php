<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\HardDriveAssignment;
use App\Models\HardDriveSwap;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HardDriveSwapController extends Controller
{
    public function __construct(protected DeviceLogService $logger) {}

    public function index()
    {
        return HardDriveSwap::with([
            'computerA', 'computerB',
            'driveA.hardDrive', 'driveB.hardDrive',
        ])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'computer_a_id' => 'required|exists:devices,id|different:computer_b_id',
            'computer_b_id' => 'required|exists:devices,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $compA = Device::findOrFail($validated['computer_a_id']);
            $compB = Device::findOrFail($validated['computer_b_id']);

            if ($compA->category !== 'computer') {
                return response()->json(['message' => "Device [{$compA->label}] is not a computer."], 422);
            }
            if ($compB->category !== 'computer') {
                return response()->json(['message' => "Device [{$compB->label}] is not a computer."], 422);
            }

            $assignA = HardDriveAssignment::where('computer_id', $compA->id)
                ->whereNull('end_date')->first();
            $assignB = HardDriveAssignment::where('computer_id', $compB->id)
                ->whereNull('end_date')->first();

            if (!$assignA) {
                return response()->json(['message' => "Computer [{$compA->label}] has no active drive installed."], 422);
            }
            if (!$assignB) {
                return response()->json(['message' => "Computer [{$compB->label}] has no active drive installed."], 422);
            }

            $driveAId = $assignA->hard_drive_id;
            $driveBId = $assignB->hard_drive_id;

            $assignA->update(['end_date' => now()]);
            $assignB->update(['end_date' => now()]);

            HardDriveAssignment::create([
                'hard_drive_id' => $driveAId,
                'computer_id'   => $compB->id,
                'start_date'    => now(),
            ]);
            HardDriveAssignment::create([
                'hard_drive_id' => $driveBId,
                'computer_id'   => $compA->id,
                'start_date'    => now(),
            ]);

            $swap = HardDriveSwap::create([
                'computer_a_id' => $compA->id,
                'computer_b_id' => $compB->id,
                'drive_a_id'    => $driveAId,
                'drive_b_id'    => $driveBId,
                'swapped_at'    => now(),
            ]);

            $this->logger->log($compA->id, 'drive_swapped', [
                'with_computer_id' => $compB->id,
                'gave_drive_id'    => $driveAId,
                'got_drive_id'     => $driveBId,
            ]);
            $this->logger->log($compB->id, 'drive_swapped', [
                'with_computer_id' => $compA->id,
                'gave_drive_id'    => $driveBId,
                'got_drive_id'     => $driveAId,
            ]);
            $this->logger->log($driveAId, 'drive_swapped', [
                'from_computer_id' => $compA->id,
                'to_computer_id'   => $compB->id,
            ]);
            $this->logger->log($driveBId, 'drive_swapped', [
                'from_computer_id' => $compB->id,
                'to_computer_id'   => $compA->id,
            ]);

            return response()->json(
                $swap->load(['computerA', 'computerB', 'driveA.hardDrive', 'driveB.hardDrive']),
                201
            );
        });
    }

    public function destroy($id)
    {
        HardDriveSwap::findOrFail($id)->delete();
        return response()->json(['message' => 'Drive swap record deleted.']);
    }

    public function computerDriveSwaps($id)
    {
        return HardDriveSwap::where('computer_a_id', $id)
            ->orWhere('computer_b_id', $id)
            ->with(['computerA', 'computerB', 'driveA.hardDrive', 'driveB.hardDrive'])
            ->latest()->get();
    }
}
