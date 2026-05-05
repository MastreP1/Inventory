<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Separate status table for cartridges.
     * Cartridges have a consumable lifecycle: they start full, get used, go empty.
     *
     * Values seeded: Full / Partial / Empty / Damaged / Obsolete
     *   - Full     → is_assignable = true  (new/full, ready to install)
     *   - Partial  → is_assignable = true  (partially used but still usable)
     *   - Empty    → is_assignable = false (needs replacement)
     *   - Damaged  → is_assignable = false
     *   - Obsolete → is_assignable = false
     */
    public function up(): void
    {
        Schema::create('cartridge_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('is_assignable')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cartridge_statuses');
    }
};
