<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * department_owners pivot — many-to-many between departments and users.
     *
     * An owner is simply a user who has been designated as responsible for
     * one or more departments. One user can own multiple departments,
     * and one department can have multiple owners.
     *
     * Owners are still regular users — they appear in assignments, movements,
     * and logs exactly like any other user.
     */
    public function up(): void
    {
        Schema::create('department_owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['department_id', 'user_id']); // no duplicate pairs
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('department_owners');
    }
};
