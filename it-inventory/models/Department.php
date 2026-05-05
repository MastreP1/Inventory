<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name'];

    /**
     * Owners of this department — many-to-many via department_owners pivot.
     * An owner is a regular User designated as responsible for this department.
     * One user can own multiple departments; one department can have multiple owners.
     */
    public function owners()
    {
        return $this->belongsToMany(User::class, 'department_owners')
                    ->withTimestamps();
    }

    /**
     * All regular users who belong to this department.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Devices assigned to this department.
     */
    public function devices()
    {
        return $this->hasMany(Device::class);
    }
}
