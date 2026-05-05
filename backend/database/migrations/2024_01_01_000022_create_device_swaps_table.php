<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Records location swaps between two devices.
     * Device A takes Device B's location and vice versa.
     *
     * location_a_id / location_b_id are snapshots of the locations
     * BEFORE the swap — historical record of what moved where.
     */
    public function up(): void
    {
        Schema::create('device_swaps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_a_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('device_b_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('location_a_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('location_b_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->timestamp('swapped_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_swaps');
    }
};
