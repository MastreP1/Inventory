<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Specialized table for devices with category = 'computer'.
     * Covers: Laptop, Mini Tower, Tower, Server, Phone (anything in the computer category).
     *
     * All columns are nullable — these are optional enrichment fields.
     * The device still exists and is fully functional in the system without them.
     * They are informational for the inventory manager.
     */
    public function up(): void
    {
        Schema::create('computers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('cpu')->nullable();   // e.g. "Intel Core i7-1265U"
            $table->string('ram')->nullable();   // e.g. "16GB DDR4"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('computers');
    }
};
