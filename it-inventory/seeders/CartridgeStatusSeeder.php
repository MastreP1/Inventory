<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CartridgeStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['name' => 'Full',     'is_assignable' => true],  // new cartridge
            ['name' => 'Partial',  'is_assignable' => true],  // partially used, still usable
            ['name' => 'Empty',    'is_assignable' => false], // needs replacement
            ['name' => 'Damaged',  'is_assignable' => false],
            ['name' => 'Obsolete', 'is_assignable' => false],
        ];

        foreach ($statuses as $status) {
            DB::table('cartridge_statuses')->insertOrIgnore([
                'name'          => $status['name'],
                'is_assignable' => $status['is_assignable'],
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }
}
