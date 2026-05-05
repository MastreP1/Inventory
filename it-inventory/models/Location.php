<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = ['site_id', 'name'];

    /**
     * Site is auto-derived — the frontend only picks a location,
     * and the site is resolved via this relation.
     */
    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function devices()
    {
        return $this->hasMany(Device::class);
    }
}
