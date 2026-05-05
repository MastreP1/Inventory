<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add phone-specific fields to computers table.
     * Phones are category=computer with device_type.name='Phone'.
     * These fields are null for non-phone computers.
     */
    public function up(): void
    {
        Schema::table('computers', function (Blueprint $table) {
            $table->string('imei')->nullable()->unique()->after('ram');
            $table->string('phone_number')->nullable()->after('imei');
        });
    }

    public function down(): void
    {
        Schema::table('computers', function (Blueprint $table) {
            $table->dropColumn(['imei', 'phone_number']);
        });
    }
};
