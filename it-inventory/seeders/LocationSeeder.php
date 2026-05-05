<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        // Confirmed site → location mapping
        $locations = [
            'LILLY' => [
                'HR Office',
                'Omar Office',
                'Procurement Office',
                'BC ProdB',
                'ProdC',
                'ProdD',
                'ProdE',
                'Security Agent Office',
                'Server Room',
                'TL-BC Office',
                'Training 3',
            ],
            'LILLY2' => [
                'Stock',
                'Open Space',
                'EA ProdB',
                'Training 5',
            ],
            'BCP' => [
                'BackUp',
            ],
        ];

        foreach ($locations as $siteName => $rooms) {
            $siteId = DB::table('sites')->where('name', $siteName)->value('id');

            foreach ($rooms as $name) {
                DB::table('locations')->insertOrIgnore([
                    'site_id'    => $siteId,
                    'name'       => $name,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
