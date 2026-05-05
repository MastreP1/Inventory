<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Specialized table for devices with category = 'printer'.
     * These attributes define the printer's capabilities and are required
     * for cartridge compatibility checks.
     */
    public function up(): void
    {
        Schema::create('printers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('printer_type', ['laser', 'inkjet']);
            $table->boolean('duplex')->default(false);        // supports double-sided printing
            $table->boolean('color_support')->default(false); // supports color printing
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('printers');
    }
};
