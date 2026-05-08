<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add soft-delete support to the devices table.
     *
     * WHY SOFT DELETE?
     * ─────────────────
     * device_logs.device_id has a cascadeOnDelete FK, meaning a hard DELETE
     * on a device would silently wipe its entire audit trail — exactly what
     * the log system is designed to prevent.
     *
     * With SoftDeletes, $device->delete() only sets deleted_at = now().
     * The DB row stays, the FK cascade never fires, and every log entry
     * (device_created, assigned, moved, device_deleted …) is preserved forever.
     *
     * The Device model's global scope automatically excludes soft-deleted rows
     * from all normal queries (index, show, assignments, movements, etc.),
     * so the rest of the application behaves exactly as before.
     *
     * Restoring a device (if ever needed): Device::withTrashed()->find($id)->restore()
     */
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            // Adds nullable `deleted_at` timestamp — null = active, set = soft-deleted
            $table->softDeletes()->after('comment');
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};