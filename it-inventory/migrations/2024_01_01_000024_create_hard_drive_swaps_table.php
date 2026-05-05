<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Records hard drive swaps between two computers.
     * Computer A gets Computer B's drive and vice versa.
     *
     * computer_a_id / computer_b_id → the two host machines
     * drive_a_id / drive_b_id → snapshot of which drive was in which computer before the swap
     *
     * Both drives must have an open hard_drive_assignment at swap time.
     * After the swap, those assignments are closed and two new ones are created.
     */
    public function up(): void
    {
        Schema::create('hard_drive_swaps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('computer_a_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('computer_b_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('drive_a_id')->nullable()->constrained('devices')->nullOnDelete();
            $table->foreignId('drive_b_id')->nullable()->constrained('devices')->nullOnDelete();
            $table->timestamp('swapped_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hard_drive_swaps');
    }
};
