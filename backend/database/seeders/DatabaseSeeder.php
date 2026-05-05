<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DepartmentSeeder::class,      // no deps
            SiteSeeder::class,            // no deps
            LocationSeeder::class,        // needs sites
            ManufacturerSeeder::class,    // no deps
            DeviceTypeSeeder::class,      // no deps
            DeviceModelSeeder::class,     // needs manufacturers + device_types
            StatusSeeder::class,          // device statuses
            DriveStatusSeeder::class,     // hard drive statuses
            CartridgeStatusSeeder::class, // cartridge statuses
            UserSeeder::class,            // needs departments
            DepartmentOwnerSeeder::class, // needs users + departments → inserts into pivot
            DeviceSeeder::class,          // needs everything above
        ]);
    }
}
