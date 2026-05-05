<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * device_types is a manageable reference table (admin can add new types from frontend).
     *
     * The `category` column is the internal discriminator that tells the system
     * which specialized table to join when fetching a device's full record:
     *   - computer   → computers table
     *   - printer    → printers table
     *   - monitor    → monitors table
     *   - hard_drive → hard_drives table
     *   - cartridge  → cartridges table
     *
     * Example: "Laptop", "Mini Tower", "Server", "Tower" all map to category=computer.
     * "Phone" maps to category=computer (it has no specialized table yet — extensible).
     */
    public function up(): void
    {
        Schema::create('device_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->enum('category', [
                'computer',
                'printer',
                'monitor',
                'hard_drive',
                'cartridge',
            ]);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_types');
    }
};
