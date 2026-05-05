<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DriveStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['name' => 'Available', 'is_assignable' => true],   // spare, ready to install
            ['name' => 'In Service',    'is_assignable' => false],  // installed in a computer
            ['name' => 'Damaged',   'is_assignable' => false],
            ['name' => 'Obsolete',  'is_assignable' => false],
            ['name' => 'Out',  'is_assignable' => false],
            ['name' => 'Returned',  'is_assignable' => false],
        ];

        foreach ($statuses as $status) {
            DB::table('drive_statuses')->insertOrIgnore([
                'name'          => $status['name'],
                'is_assignable' => $status['is_assignable'],
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }
}
