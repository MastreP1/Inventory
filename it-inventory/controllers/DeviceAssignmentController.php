<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceAssignment;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceAssignmentController extends Controller
{
    public function __construct(protected DeviceLogService $logger) {}

    public function index()
    {
        return DeviceAssignment::with(['device', 'user'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|exists:devices,id',
            'user_id'   => 'required|exists:users,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $device = Device::with(['status'])->findOrFail($validated['device_id']);

            if (!in_array($device->category, ['computer', 'printer', 'monitor'])) {
                return response()->json([
                    'message' => "Devices of category [{$device->category}] cannot be assigned to users via this endpoint.",
                ], 422);
            }

            if ($device->status && !$device->status->is_assignable) {
                return response()->json([
                    'message' => "Device [{$device->label}] has status [{$device->status->name}] which is not assignable.",
                ], 422);
            }

            // Close any open assignment for this device
            DeviceAssignment::where('device_id', $device->id)
                ->whereNull('end_date')
                ->update(['end_date' => now()]);

            $device->update(['user_id' => $validated['user_id']]);

            // Auto-set status to In Service
            $inService = \App\Models\Status::where('name', 'In Service')->first();
            if ($inService) {
                $device->update(['status_id' => $inService->id]);
            }

            $assignment = DeviceAssignment::create([
                'device_id'  => $device->id,
                'user_id'    => $validated['user_id'],
                'start_date' => now(),
            ]);

            $this->logger->log($device->id, 'assigned', [
                'user_id'       => $validated['user_id'],
                'assignment_id' => $assignment->id,
            ]);

            return response()->json($assignment->load(['device', 'user']), 201);
        });
    }

    public function end($id)
    {
        return DB::transaction(function () use ($id) {
            $assignment = DeviceAssignment::with('device')->findOrFail($id);

            if ($assignment->end_date) {
                return response()->json(['message' => 'Assignment is already ended.'], 422);
            }

            $assignment->update(['end_date' => now()]);

            $device = $assignment->device;
            if ($device && $device->user_id === $assignment->user_id) {
                $device->update(['user_id' => null]);

                $reserved = \App\Models\Status::where('name', 'Reserved')->first();
                if ($reserved) {
                    $device->update(['status_id' => $reserved->id]);
                }
            }

            $this->logger->log($assignment->device_id, 'unassigned', [
                'user_id'       => $assignment->user_id,
                'assignment_id' => $assignment->id,
            ]);

            return response()->json(['message' => 'Assignment ended.']);
        });
    }

    /**
     * DELETE /assignments/:id
     * Hard delete — removes the record entirely.
     * Only use for erroneous records. Prefer /end for normal workflow.
     */
    public function destroy($id)
    {
        $assignment = DeviceAssignment::findOrFail($id);
        $assignment->delete();
        return response()->json(['message' => 'Assignment record deleted.']);
    }

    public function deviceAssignments($id)
    {
        return DeviceAssignment::where('device_id', $id)
            ->with('user')
            ->latest()
            ->get();
    }

    public function userAssignments($id)
    {
        return DeviceAssignment::where('user_id', $id)
            ->with('device')
            ->latest()
            ->get();
    }
}
