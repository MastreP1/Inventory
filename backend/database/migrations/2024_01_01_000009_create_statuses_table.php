<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Statuses for regular devices (computers, printers, monitors).
     *
     * is_assignable: can a device in this status be assigned to a user?
     *   - Out          → no  (device is out of the building)
     *   - Returned     → no  (just came back, pending processing)
     *   - In Service   → no  (already in use — assignment sets this automatically)
     *   - Damaged      → no
     *   - Reserved     → YES (in stock, ready to be assigned)
     *   - Obsolete     → no
     *
     * Note: Hard drives and cartridges use a separate status table (see migrations
     * 000010 and 000011) because their lifecycle is different.
     */
    public function up(): void
    {
        Schema::create('statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('is_assignable')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statuses');
    }
};
