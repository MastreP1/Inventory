<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Specialized table for devices with category = 'cartridge'.
     *
     * Cartridges are consumable items each tracked as a unique physical item.
     * They are assigned to printers via cartridge_assignments.
     *
     * ink_type must match the printer's printer_type (laser ↔ laser, inkjet ↔ inkjet).
     * This is enforced at the application layer in CartridgeAssignmentController.
     *
     * printer_compatibility is a free-text field for the model reference printed on the box,
     * e.g. "HP 85A", "Canon 054", "Brother TN-2420".
     */
    public function up(): void
    {
        Schema::create('cartridges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('ink_type', ['laser', 'inkjet']);
            $table->string('printer_compatibility'); // e.g. "HP 85A / Canon 054"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cartridges');
    }
};
