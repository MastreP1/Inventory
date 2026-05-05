<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use App\Models\Device;
use App\Models\HardDriveAssignment;
use App\Models\DriveStatus;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HardDriveAssignmentController extends Controller
{
    public function __construct(protected DeviceLogService $logger) {}

    public function index()
    {
        return HardDriveAssignment::with([
            'hardDrive.hardDrive',
            'computer',
        ])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'hard_drive_id' => 'required|exists:devices,id',
            'computer_id'   => 'required|exists:devices,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $drive    = Device::with(['hardDrive', 'driveStatus'])->findOrFail($validated['hard_drive_id']);
            $computer = Device::findOrFail($validated['computer_id']);

            if ($drive->category !== 'hard_drive') {
                return response()->json(['message' => "Device [{$drive->label}] is not a hard drive."], 422);
            }
            if ($computer->category !== 'computer') {
                return response()->json(['message' => "Device [{$computer->label}] is not a computer."], 422);
            }

            $existing = HardDriveAssignment::where('hard_drive_id', $drive->id)
                ->whereNull('end_date')->first();
            if ($existing) {
                return response()->json([
                    'message' => "Drive [{$drive->label}] is already installed in computer ID [{$existing->computer_id}].",
                ], 422);
            }

            if ($drive->driveStatus && !$drive->driveStatus->is_assignable) {
                return response()->json([
                    'message' => "Drive [{$drive->label}] has état [{$drive->driveStatus->name}] which is not assignable.",
                ], 422);
            }

            $assignment = HardDriveAssignment::create([
                'hard_drive_id' => $drive->id,
                'computer_id'   => $computer->id,
                'start_date'    => now(),
            ]);

            // Set état to Installed (replaces old "In Use")
            $installed = DriveStatus::where('name', 'Installed')->first();
            if ($installed) {
                $drive->update(['drive_status_id' => $installed->id]);
            }

            $this->logger->log($drive->id, 'drive_assigned', [
                'computer_id'    => $computer->id,
                'computer_label' => $computer->label,
                'assignment_id'  => $assignment->id,
            ]);
            $this->logger->log($computer->id, 'drive_assigned', [
                'hard_drive_id'    => $drive->id,
                'hard_drive_label' => $drive->label,
                'assignment_id'    => $assignment->id,
            ]);

            return response()->json($assignment->load(['hardDrive', 'computer']), 201);
        });
    }

    public function end($id)
    {
        return DB::transaction(function () use ($id) {
            $assignment = HardDriveAssignment::with(['hardDrive', 'computer'])->findOrFail($id);

            if ($assignment->end_date) {
                return response()->json(['message' => 'Assignment is already ended.'], 422);
            }

            $assignment->update(['end_date' => now()]);

            // Set état back to InStock/Used (was installed, now removed)
            $inStockUsed = DriveStatus::where('name', 'InStock/Used')->first();
            if ($inStockUsed && $assignment->hardDrive) {
                $assignment->hardDrive->update(['drive_status_id' => $inStockUsed->id]);
            }

            $this->logger->log($assignment->hard_drive_id, 'drive_unassigned', [
                'computer_id'    => $assignment->computer_id,
                'computer_label' => $assignment->computer?->label,
                'new_etat'       => 'InStock/Used',
            ]);
            $this->logger->log($assignment->computer_id, 'drive_unassigned', [
                'hard_drive_id'    => $assignment->hard_drive_id,
                'hard_drive_label' => $assignment->hardDrive?->label,
            ]);

            return response()->json(['message' => 'Drive removed from computer. État set to InStock/Used.']);
        });
    }

    public function destroy($id)
    {
        $assignment = HardDriveAssignment::findOrFail($id);
        $assignment->delete();
        return response()->json(['message' => 'Drive assignment record deleted.']);
    }

    public function deviceDriveAssignments($id)
    {
        $device = Device::findOrFail($id);

        if ($device->category === 'hard_drive') {
            return HardDriveAssignment::where('hard_drive_id', $id)
                ->with('computer')->latest()->get();
        }
        if ($device->category === 'computer') {
            return HardDriveAssignment::where('computer_id', $id)
                ->with('hardDrive.hardDrive')->latest()->get();
        }

        return response()->json(['message' => 'Device is not a computer or hard drive.'], 422);
    }
}