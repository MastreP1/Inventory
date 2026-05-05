<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'name',
        'email',
        'department_id',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Devices currently assigned to this user (via devices.user_id).
     * This is the "live" snapshot — not the full history.
     */
    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    /**
     * Full device assignment history for this user.
     */
    public function deviceAssignments()
    {
        return $this->hasMany(DeviceAssignment::class);
    }

    /**
     * Departments this user owns (many-to-many via department_owners pivot).
     * A user can be the owner of multiple departments simultaneously.
     */
    public function ownedDepartments()
    {
        return $this->belongsToMany(Department::class, 'department_owners')
                    ->withTimestamps();
    }
}
