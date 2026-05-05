<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        // owner_id is set later by DepartmentOwnerSeeder (needs users to exist first)
        $departments = ['BCG', 'HEDD', 'IT', 'MISC', 'MP'];

        foreach ($departments as $name) {
            DB::table('departments')->insertOrIgnore([
                'name'       => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
