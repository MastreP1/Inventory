<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Assignment history for devices assigned to users.
     * Applies to: computers, printers, monitors.
     *
     * Hard drives and cartridges have their own assignment tables because
     * they are assigned to other DEVICES, not to users.
     *
     * - end_date null  → assignment is currently active
     * - end_date set   → assignment has ended (historical record)
     *
     * When a new assignment is created for a device, any existing open
     * assignment is auto-closed (DeviceAssignmentController handles this).
     */
    public function up(): void
    {
        Schema::create('device_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();
            $table->timestamps();

            $table->index(['device_id', 'end_date']); // fast lookup for open assignments
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_assignments');
    }
};
