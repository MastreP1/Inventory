<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Unified audit log table for all device-related events.
     *
     * Every action on any device — assignment, movement, swap, status change —
     * generates a log entry here.
     *
     * `device_id` — the device this log entry is ABOUT (always set)
     *
     * `action` — what happened. Full list of possible values:
     *   Device lifecycle:
     *     status_changed       — manual status change (not triggered by assignment)
     *   User assignments (computers, printers, monitors):
     *     assigned             — device assigned to a user
     *     unassigned           — assignment ended
     *   Movements:
     *     moved                — device moved to a new location
     *   Location swaps:
     *     location_swapped     — device swapped locations with another device
     *   Owner swaps:
     *     owner_swapped        — device's user swapped with another device's user
     *   Hard drive operations:
     *     drive_assigned       — hard drive installed in a computer
     *     drive_unassigned     — hard drive removed from a computer
     *     drive_swapped        — two computers swapped their drives
     *   Cartridge operations:
     *     cartridge_assigned   — cartridge installed in a printer
     *     cartridge_unassigned — cartridge removed from a printer
     *     cartridge_swapped    — cartridge replaced in a printer
     *
     * `details` — JSON object with context relevant to the action.
     *   Examples:
     *     status_changed:    { "from": "Reserved", "to": "Damaged" }
     *     assigned:          { "user_id": 3, "user_name": "Alice Martin" }
     *     moved:             { "from_location_id": 2, "to_location_id": 5 }
     *     drive_assigned:    { "hard_drive_id": 12, "computer_id": 4 }
     *     cartridge_swapped: { "old_cartridge_id": 7, "new_cartridge_id": 9 }
     *
     * `logged_at` — explicit timestamp (not relying on created_at) for precision.
     */
    public function up(): void
    {
        Schema::create('device_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->string('action');
            $table->json('details')->nullable();
            $table->timestamp('logged_at');
            $table->timestamps();

            $table->index(['device_id', 'logged_at']);
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_logs');
    }
};
