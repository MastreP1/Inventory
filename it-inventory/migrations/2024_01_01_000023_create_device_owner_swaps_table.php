<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Records ownership swaps between two devices.
     * Device A gets Device B's user and vice versa.
     *
     * user_a_id / user_b_id are snapshots of the users BEFORE the swap.
     * Null is valid — swapping with an unassigned device transfers null.
     */
    public function up(): void
    {
        Schema::create('device_owner_swaps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_a_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('device_b_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('user_a_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('user_b_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('swapped_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_owner_swaps');
    }
};
