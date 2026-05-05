<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusSeeder extends Seeder
{
    public function run(): void
    {
        // Device statuses (computers / printers / monitors)
        // is_assignable = true only for Reserved
        $statuses = [
            ['name' => 'Out',        'is_assignable' => false],
            ['name' => 'Returned',   'is_assignable' => false],
            ['name' => 'In Service', 'is_assignable' => false], // set auto on assignment
            ['name' => 'Damaged',    'is_assignable' => false],
            ['name' => 'Reserved',   'is_assignable' => true],  // in stock, ready to assign
            ['name' => 'Obsolete',   'is_assignable' => false],
        ];

        foreach ($statuses as $status) {
            DB::table('statuses')->insertOrIgnore([
                'name'          => $status['name'],
                'is_assignable' => $status['is_assignable'],
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }
}
