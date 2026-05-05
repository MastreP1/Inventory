<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Assignment history for hard drives installed in computers.
     *
     * hard_drive_id → must be a device with category = 'hard_drive'
     * computer_id   → must be a device with category = 'computer'
     *
     * A computer can have multiple drives (no unique constraint on computer_id).
     * A hard drive can only be in one computer at a time
     * (enforced by checking for open assignments on the drive at store time).
     *
     * end_date null → drive is currently installed in that computer.
     */
    public function up(): void
    {
        Schema::create('hard_drive_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hard_drive_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('computer_id')->constrained('devices')->cascadeOnDelete();
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();
            $table->timestamps();

            $table->index(['hard_drive_id', 'end_date']);
            $table->index(['computer_id', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hard_drive_assignments');
    }
};
