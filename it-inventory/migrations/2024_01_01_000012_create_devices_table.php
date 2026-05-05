<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The `devices` table is the shared base for ALL device types.
     *
     * Every physical item tracked in this system — whether a laptop, a printer,
     * a monitor, a hard drive, or a cartridge — has one row here.
     *
     * Type-specific attributes live in their own tables (computers, printers,
     * monitors, hard_drives, cartridges), each with a device_id FK pointing here.
     *
     * The `category` column (derived from device_types.category) is stored here
     * as a denormalized discriminator to:
     *   1. Quickly determine which specialized table to join without loading device_type
     *   2. Enforce business rules at the app level (e.g. "user can't have 2 computers")
     *
     * `user_id` — current assigned user (null if unassigned). Monitors use this.
     *             Computers and other devices also use this for their primary user.
     *             Hard drives and cartridges do NOT use this FK — they have their own
     *             assignment tables (hard_drive_assignments, cartridge_assignments).
     *
     * `status_id` — FK to `statuses` for computers/printers/monitors.
     *               Hard drives use `drive_statuses`, cartridges use `cartridge_statuses`.
     *               All three status FKs are nullable here; the correct one is enforced
     *               at the application layer based on category.
     */
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();

            // Core identity
            $table->string('label')->unique();
            $table->string('serial_number')->unique()->nullable();

            // Classification — what kind of device is this?
            $table->foreignId('device_type_id')->constrained()->restrictOnDelete();
            $table->enum('category', [
                'computer',
                'printer',
                'monitor',
                'hard_drive',
                'cartridge',
            ]);

            // Hardware identity
            $table->foreignId('manufacturer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('device_model_id')->nullable()->constrained()->nullOnDelete();

            // Location — where is this device physically?
            // location_id derives site automatically via location→site relation.
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();

            // Organisational assignment
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();

            // Current user holding this device (computers, monitors, phones).
            // Hard drives and cartridges use their own assignment tables instead.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Status FKs — only one will be populated based on category.
            // Computers / printers / monitors → status_id
            // Hard drives                     → drive_status_id
            // Cartridges                      → cartridge_status_id
            $table->foreignId('status_id')
                  ->nullable()
                  ->constrained('statuses')
                  ->nullOnDelete();

            $table->foreignId('drive_status_id')
                  ->nullable()
                  ->constrained('drive_statuses')
                  ->nullOnDelete();

            $table->foreignId('cartridge_status_id')
                  ->nullable()
                  ->constrained('cartridge_statuses')
                  ->nullOnDelete();

            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
