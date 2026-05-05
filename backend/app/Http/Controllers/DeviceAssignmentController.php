<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use App\Models\Device;
use App\Models\DeviceAssignment;
use App\Models\User;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceAssignmentController extends Controller
{
    /**
     * Maps device category → display category for uniqueness rule.
     * A user may only hold ONE device per display category at a time.
     *
     * Display categories:
     *   pc       → computer (excluding Phone type)
     *   mobile   → computer with device_type.name = Phone
     *   printer  → printer
     *   monitor  → monitor
     */
    private const UNIQUE_CATEGORIES = ['computer', 'printer', 'monitor'];

    public function __construct(protected DeviceLogService $logger) {}

    public function index()
    {
        return DeviceAssignment::with(['device.deviceType', 'user'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|exists:devices,id',
            'user_id'   => 'required|exists:users,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $device = Device::with(['status', 'deviceType'])->findOrFail($validated['device_id']);
            $user   = User::with('department')->findOrFail($validated['user_id']);

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

            // ── Uniqueness rule: user can only have ONE device per display-category ──
            // Determine the display category of the device being assigned
            $displayCat = $this->getDisplayCategory($device);

            $existingActiveAssignment = DeviceAssignment::where('user_id', $user->id)
                ->whereNull('end_date')
                ->whereHas('device', function ($q) use ($displayCat, $device) {
                    if ($displayCat === 'mobile') {
                        // Phone devices only
                        $q->where('category', 'computer')
                          ->whereHas('deviceType', fn($dq) => $dq->where('name', 'Phone'));
                    } else {
                        // Same category, excluding Phone
                        $q->where('category', $device->category)
                          ->whereHas('deviceType', fn($dq) => $dq->where('name', '!=', 'Phone'));
                    }
                })
                ->with('device')
                ->first();

            if ($existingActiveAssignment) {
                $existing = $existingActiveAssignment->device;
                return response()->json([
                    'message' => "User [{$user->name}] already has a [{$displayCat}] assigned: [{$existing->label}]. End that assignment first.",
                ], 422);
            }

            // Close any open assignment for this device (different user)
            DeviceAssignment::where('device_id', $device->id)
                ->whereNull('end_date')
                ->update(['end_date' => now()]);

            // Update device: assign user and auto-set department from user's department
            $deviceUpdates = ['user_id' => $user->id];
            if ($user->department_id) {
                $deviceUpdates['department_id'] = $user->department_id;
            }

            // Auto-set status to In Service
            $inService = \App\Models\Status::where('name', 'In Service')->first();
            if ($inService) {
                $deviceUpdates['status_id'] = $inService->id;
            }

            $device->update($deviceUpdates);

            $assignment = DeviceAssignment::create([
                'device_id'  => $device->id,
                'user_id'    => $user->id,
                'start_date' => now(),
            ]);

            $this->logger->log($device->id, 'assigned', [
                'user_id'       => $user->id,
                'user_name'     => $user->name,
                'department_id' => $user->department_id,
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
                $deviceUpdates = ['user_id' => null];

                // Set status back to Reserved
                $reserved = \App\Models\Status::where('name', 'Reserved')->first();
                if ($reserved) {
                    $deviceUpdates['status_id'] = $reserved->id;
                }

                $device->update($deviceUpdates);
            }

            $this->logger->log($assignment->device_id, 'unassigned', [
                'user_id'       => $assignment->user_id,
                'assignment_id' => $assignment->id,
            ]);

            return response()->json(['message' => 'Assignment ended.']);
        });
    }

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
            ->with(['device.deviceType'])
            ->latest()
            ->get();
    }

    /**
     * Determine the "display category" of a device for uniqueness enforcement.
     * Phones are category=computer but display as "mobile".
     */
    private function getDisplayCategory(Device $device): string
    {
        if ($device->category === 'computer' && $device->deviceType?->name === 'Phone') {
            return 'mobile';
        }
        return $device->category; // computer, printer, monitor
    }
}