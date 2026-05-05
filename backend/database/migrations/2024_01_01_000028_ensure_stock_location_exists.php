<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ensure a "Stock" location exists in every site.
     * The auto-stock-relocation feature (triggered when status → Reserved/InStock/*)
     * moves devices to the first "Stock" location found.
     *
     * If no Stock location exists at all, create one under the first available site.
     */
    public function up(): void
    {
        $stockExists = DB::table('locations')->where('name', 'Stock')->exists();

        if (!$stockExists) {
            // Try to find an existing site to attach to
            $firstSite = DB::table('sites')->first();

            if ($firstSite) {
                DB::table('locations')->insert([
                    'site_id'    => $firstSite->id,
                    'name'       => 'Stock',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            // If no site exists, the Stock location will be created when the first site is added
            // via a database seeder or the frontend.
        }
    }

    public function down(): void
    {
        // Do not auto-delete the Stock location — it may have devices assigned
    }
};
