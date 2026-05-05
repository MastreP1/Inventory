<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Assignment history for cartridges installed in printers.
     *
     * cartridge_id → must be a device with category = 'cartridge'
     * printer_id   → must be a device with category = 'printer'
     *
     * Business rule enforced at application layer:
     *   cartridges.ink_type must match printers.printer_type
     *   (laser cartridge → laser printer, inkjet cartridge → inkjet printer)
     *
     * A printer can only have one active cartridge at a time
     * (enforced by checking for open assignments on the printer).
     * A cartridge can only be in one printer at a time.
     *
     * end_date null → cartridge is currently installed.
     */
    public function up(): void
    {
        Schema::create('cartridge_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cartridge_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('printer_id')->constrained('devices')->cascadeOnDelete();
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();
            $table->timestamps();

            $table->index(['cartridge_id', 'end_date']);
            $table->index(['printer_id', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cartridge_assignments');
    }
};
