<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ManufacturerSeeder extends Seeder
{
    public function run(): void
    {
        $manufacturers = [
            'ASUS',
            'Dell',
            'Hewlett-Packard',
            'Lenovo',
            'MSI',
            'Apple',
            'Samsung',
            'Cisco',
            'Logitech',
            'HP',
            'Canon',
            'Brother',
            'Epson',
            'Seagate',
            'Western Digital',
            'Kingston',
            'Samsung',
        ];

        // Deduplicate in case of copy errors
        $manufacturers = array_unique($manufacturers);

        foreach ($manufacturers as $name) {
            DB::table('manufacturers')->insertOrIgnore([
                'name'       => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
