<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Separate status table for hard drives.
     * Hard drives have a different lifecycle than devices:
     * they are stored, assigned to computers, removed, repaired, etc.
     *
     * Values seeded: Available / In Use / Damaged / Obsolete
     *   - Available  → is_assignable = true  (spare, ready to install)
     *   - In Use     → is_assignable = false (currently inside a device)
     *   - Damaged    → is_assignable = false
     *   - Obsolete   → is_assignable = false
     */
    public function up(): void
    {
        Schema::create('drive_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('is_assignable')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drive_statuses');
    }
};
