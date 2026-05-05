<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Records cartridge replacements in printers.
     *
     * Unlike a full device_swap (which exchanges two devices' locations),
     * a cartridge swap replaces the OLD cartridge in a printer with a NEW one.
     *
     * printer_id     → the printer getting a new cartridge
     * old_cartridge_id → the cartridge being removed (ends its assignment, status → Empty)
     * new_cartridge_id → the cartridge being installed (starts new assignment)
     *
     * The new cartridge must be unassigned and have is_assignable = true.
     * ink_type of new cartridge must match printer.printer_type.
     */
    public function up(): void
    {
        Schema::create('cartridge_swaps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('printer_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('old_cartridge_id')->nullable()->constrained('devices')->nullOnDelete();
            $table->foreignId('new_cartridge_id')->constrained('devices')->cascadeOnDelete();
            $table->timestamp('swapped_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cartridge_swaps');
    }
};
