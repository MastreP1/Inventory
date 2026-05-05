<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviceTypeSeeder extends Seeder
{
    public function run(): void
    {
        // name → category (internal discriminator)
        // category determines which specialized table is used
        $types = [
            ['name' => 'Laptop',     'category' => 'computer'],
            ['name' => 'Mini Tower', 'category' => 'computer'],
            ['name' => 'Tower',      'category' => 'computer'],
            ['name' => 'Server',     'category' => 'computer'],
            ['name' => 'Phone',      'category' => 'computer'],
            ['name' => 'Printer',    'category' => 'printer'],
            ['name' => 'Monitor',    'category' => 'monitor'],
            ['name' => 'Hard Drive', 'category' => 'hard_drive'],
            ['name' => 'Cartridge',  'category' => 'cartridge'],
        ];

        foreach ($types as $type) {
            DB::table('device_types')->insertOrIgnore([
                'name'       => $type['name'],
                'category'   => $type['category'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
