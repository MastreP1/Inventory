<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SiteSeeder extends Seeder
{
    public function run(): void
    {
        // Sites are physical floors — LILLY / LILLY2 / BCP
        $sites = ['LILLY', 'LILLY2', 'BCP'];

        foreach ($sites as $name) {
            DB::table('sites')->insertOrIgnore([
                'name'       => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
