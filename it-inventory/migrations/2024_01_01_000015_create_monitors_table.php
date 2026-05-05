<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Specialized table for devices with category = 'monitor'.
     * All columns are nullable — monitors can be registered with just a label/serial.
     * Technical specs are optional informational fields.
     */
    public function up(): void
    {
        Schema::create('monitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('panel_type', ['IPS', 'TN', 'VA', 'OLED'])->nullable();
            $table->decimal('size_inches', 4, 1)->nullable(); // e.g. 27.0, 24.5
            // video_inputs stored as JSON array: ["HDMI", "DisplayPort", "VGA"]
            $table->json('video_inputs')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitors');
    }
};
