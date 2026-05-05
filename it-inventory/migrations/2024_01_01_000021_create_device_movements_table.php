<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tracks physical movement of any device from one location to another.
     * Applies to all categories — a hard drive can be moved between storage rooms,
     * a printer can be moved between floors, etc.
     *
     * from_location_id is auto-captured from device.location_id at move time.
     * The admin only provides: device_id + to_location_id.
     */
    public function up(): void
    {
        Schema::create('device_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('to_location_id')->constrained('locations')->restrictOnDelete();
            $table->timestamp('moved_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_movements');
    }
};
