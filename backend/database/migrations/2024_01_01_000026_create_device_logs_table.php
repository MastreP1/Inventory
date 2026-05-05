<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Unified audit log table for all device-related events.
     *
     * `action` — full list of possible values:
     *
     *   Device lifecycle:
     *     status_changed           — manual status change
     *     auto_stock_relocation    — auto-moved to Stock + user cleared when
     *                                status changed to Reserved/InStock/New/InStock/Used
     *
     *   User assignments (computers, printers, monitors):
     *     assigned                 — device assigned to a user
     *     unassigned               — assignment ended
     *
     *   Movements:
     *     moved                    — device moved to a new location
     *
     *   Location swaps:
     *     location_swapped         — device swapped locations with another device
     *
     *   Owner swaps:
     *     owner_swapped            — device's user swapped with another device's user
     *
     *   Hard drive (Disque) operations:
     *     drive_assigned           — hard drive installed in a computer
     *     drive_unassigned         — hard drive removed from a computer
     *     drive_swapped            — two computers swapped their drives
     *
     *   Cartridge operations:
     *     cartridge_assigned       — cartridge installed in a printer
     *     cartridge_unassigned     — cartridge removed from a printer
     *     cartridge_swapped        — cartridge replaced in a printer (Cartridge Change)
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
