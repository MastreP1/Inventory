<?php

namespace App\Http\Controllers;

use App\Models\Status;
use App\Models\DriveStatus;
use App\Models\CartridgeStatus;
use App\Models\Location;
use App\Models\Site;
use App\Models\Manufacturer;
use App\Models\DeviceModel;
use App\Models\DeviceType;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;

class LookupController extends Controller
{
    /* ═══════════════════════════════════════════════
     |  SITES
    ═══════════════════════════════════════════════ */

    public function sites()
    {
        return Site::withCount('locations')->orderBy('name')->get();
    }

    public function storeSite(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:sites,name',
        ]);
        return response()->json(Site::create($validated), 201);
    }

    public function destroySite($id)
    {
        $site = Site::findOrFail($id);
        // Prevent deletion if locations exist under this site
        if ($site->locations()->exists()) {
            return response()->json([
                'message' => "Cannot delete site [{$site->name}] — it still has locations assigned to it. Delete or reassign those locations first.",
            ], 422);
        }
        $site->delete();
        return response()->json(['message' => 'Site deleted.']);
    }

    /* ═══════════════════════════════════════════════
     |  LOCATIONS
    ═══════════════════════════════════════════════ */

    public function locations()
    {
        return Location::with('site')->orderBy('name')->get();
    }

    public function storeLocation(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'name'    => 'required|string',
        ]);

        // Unique within site
        $exists = Location::where('site_id', $validated['site_id'])
            ->where('name', $validated['name'])
            ->exists();
        if ($exists) {
            return response()->json([
                'message' => 'A location with this name already exists in the selected site.',
            ], 422);
        }

        return response()->json(Location::create($validated)->load('site'), 201);
    }

    public function destroyLocation($id)
    {
        $location = Location::findOrFail($id);
        if ($location->devices()->exists()) {
            return response()->json([
                'message' => "Cannot delete location [{$location->name}] — devices are still assigned here.",
            ], 422);
        }
        $location->delete();
        return response()->json(['message' => 'Location deleted.']);
    }

    /* ═══════════════════════════════════════════════
     |  MANUFACTURERS
    ═══════════════════════════════════════════════ */

    public function manufacturers()
    {
        return Manufacturer::orderBy('name')->get();
    }

    public function storeManufacturer(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:manufacturers,name',
        ]);
        return response()->json(Manufacturer::create($validated), 201);
    }

    public function destroyManufacturer($id)
    {
        $mfr = Manufacturer::findOrFail($id);
        if ($mfr->deviceModels()->exists()) {
            return response()->json([
                'message' => "Cannot delete manufacturer [{$mfr->name}] — device models reference it.",
            ], 422);
        }
        $mfr->delete();
        return response()->json(['message' => 'Manufacturer deleted.']);
    }

    /* ═══════════════════════════════════════════════
     |  DEVICE TYPES
    ═══════════════════════════════════════════════ */

    public function deviceTypes()
    {
        return DeviceType::orderBy('name')->get();
    }

    public function storeDeviceType(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|unique:device_types,name',
            'category' => 'required|in:computer,printer,monitor,hard_drive,cartridge',
        ]);
        return response()->json(DeviceType::create($validated), 201);
    }

    public function destroyDeviceType($id)
    {
        $type = DeviceType::findOrFail($id);
        if ($type->devices()->exists() || $type->deviceModels()->exists()) {
            return response()->json([
                'message' => "Cannot delete device type [{$type->name}] — devices or models reference it.",
            ], 422);
        }
        $type->delete();
        return response()->json(['message' => 'Device type deleted.']);
    }

    /* ═══════════════════════════════════════════════
     |  DEVICE MODELS
    ═══════════════════════════════════════════════ */

    public function deviceModels()
    {
        return DeviceModel::with(['manufacturer', 'deviceType'])->orderBy('name')->get();
    }

    public function storeDeviceModel(Request $request)
    {
        $validated = $request->validate([
            'manufacturer_id' => 'required|exists:manufacturers,id',
            'device_type_id'  => 'required|exists:device_types,id',
            'name'            => 'required|string',
        ]);

        $exists = DeviceModel::where('manufacturer_id', $validated['manufacturer_id'])
            ->where('name', $validated['name'])
            ->exists();
        if ($exists) {
            return response()->json([
                'message' => 'A model with this name already exists for this manufacturer.',
            ], 422);
        }

        return response()->json(
            DeviceModel::create($validated)->load(['manufacturer', 'deviceType']),
            201
        );
    }

    public function destroyDeviceModel($id)
    {
        $model = DeviceModel::findOrFail($id);
        if ($model->devices()->exists()) {
            return response()->json([
                'message' => "Cannot delete model [{$model->name}] — devices reference it.",
            ], 422);
        }
        $model->delete();
        return response()->json(['message' => 'Device model deleted.']);
    }

    /* ═══════════════════════════════════════════════
     |  STATUSES (devices)
    ═══════════════════════════════════════════════ */

    public function statuses()
    {
        return Status::orderBy('name')->get();
    }

    public function storeStatus(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|unique:statuses,name',
            'is_assignable' => 'boolean',
        ]);
        return response()->json(Status::create($validated), 201);
    }

    public function destroyStatus($id)
    {
        $status = Status::findOrFail($id);
        if ($status->devices()->exists()) {
            return response()->json([
                'message' => "Cannot delete status [{$status->name}] — devices use it.",
            ], 422);
        }
        $status->delete();
        return response()->json(['message' => 'Status deleted.']);
    }

    /* ═══════════════════════════════════════════════
     |  DRIVE STATUSES
    ═══════════════════════════════════════════════ */

    public function driveStatuses()
    {
        return DriveStatus::orderBy('name')->get();
    }

    public function storeDriveStatus(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|unique:drive_statuses,name',
            'is_assignable' => 'boolean',
        ]);
        return response()->json(DriveStatus::create($validated), 201);
    }

    public function destroyDriveStatus($id)
    {
        $status = DriveStatus::findOrFail($id);
        if ($status->hardDrives()->exists()) {
            return response()->json([
                'message' => "Cannot delete drive status [{$status->name}] — hard drives use it.",
            ], 422);
        }
        $status->delete();
        return response()->json(['message' => 'Drive status deleted.']);
    }

    /* ═══════════════════════════════════════════════
     |  CARTRIDGE STATUSES
    ═══════════════════════════════════════════════ */

    public function cartridgeStatuses()
    {
        return CartridgeStatus::orderBy('name')->get();
    }

    public function storeCartridgeStatus(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|unique:cartridge_statuses,name',
            'is_assignable' => 'boolean',
        ]);
        return response()->json(CartridgeStatus::create($validated), 201);
    }

    public function destroyCartridgeStatus($id)
    {
        $status = CartridgeStatus::findOrFail($id);
        if ($status->cartridges()->exists()) {
            return response()->json([
                'message' => "Cannot delete cartridge status [{$status->name}] — cartridges use it.",
            ], 422);
        }
        $status->delete();
        return response()->json(['message' => 'Cartridge status deleted.']);
    }

    /* ═══════════════════════════════════════════════
     |  DEPARTMENTS
    ═══════════════════════════════════════════════ */

    public function departments()
    {
        return Department::with('owners')->orderBy('name')->get();
    }

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:departments,name',
        ]);
        return response()->json(Department::create($validated)->load('owners'), 201);
    }

    public function destroyDepartment($id)
    {
        $dept = Department::findOrFail($id);
        if ($dept->users()->exists() || $dept->devices()->exists()) {
            return response()->json([
                'message' => "Cannot delete department [{$dept->name}] — users or devices still belong to it.",
            ], 422);
        }
        $dept->delete();
        return response()->json(['message' => 'Department deleted.']);
    }

    /**
     * POST /departments/:id/owners
     * Add a user as owner of this department.
     */
    public function addDepartmentOwner(Request $request, $id)
    {
        $dept      = Department::findOrFail($id);
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // attach() with pivot ignores duplicates because of unique constraint
        $dept->owners()->syncWithoutDetaching([$validated['user_id']]);

        return response()->json($dept->fresh()->load('owners'));
    }

    /**
     * DELETE /departments/:id/owners/:userId
     * Remove a user from this department's owners.
     */
    public function removeDepartmentOwner($id, $userId)
    {
        $dept = Department::findOrFail($id);
        $dept->owners()->detach($userId);
        return response()->json($dept->fresh()->load('owners'));
    }

    /* ═══════════════════════════════════════════════
     |  USERS
    ═══════════════════════════════════════════════ */

    public function users()
    {
        return User::with(['department', 'ownedDepartments'])->orderBy('name')->get();
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string',
            'email'         => 'required|email|unique:users,email',
            'department_id' => 'nullable|exists:departments,id',
        ]);
        return response()->json(
            User::create($validated)->load(['department', 'ownedDepartments']),
            201
        );
    }

    public function destroyUser($id)
    {
        $user = User::findOrFail($id);

        // Prevent deletion if user has active device assignments
        $hasActiveAssignments = \App\Models\DeviceAssignment::where('user_id', $id)
            ->whereNull('end_date')
            ->exists();
        if ($hasActiveAssignments) {
            return response()->json([
                'message' => "Cannot delete user [{$user->name}] — they have active device assignments.",
            ], 422);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }
}
