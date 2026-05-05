<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Specialized table for devices with category = 'hard_drive'.
     *
     * Hard drives have their own lifecycle:
     *   1. Registered as a standalone device (spare stock)
     *   2. Assigned to a computer via hard_drive_assignments
     *   3. Can be removed and reassigned to another computer
     *   4. Status tracked via drive_status_id on the devices table
     *
     * capacity_gb and drive_type are NOT nullable — a hard drive without these
     * attributes is incomplete and cannot be properly managed or reported on.
     */
    public function up(): void
    {
        Schema::create('hard_drives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('drive_type', ['HDD', 'SSD', 'NVMe']);
            $table->unsignedInteger('capacity_gb'); // e.g. 256, 512, 1000, 2000
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hard_drives');
    }
};
