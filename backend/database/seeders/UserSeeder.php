<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Departments: BCG, HEDD, IT, MISC, MP
        //
        // Owners — named after their department(s).
        // "BCG-MP Owner" owns both BCG and MP (the cross-dept owner case).
        // Each other dept has its own dedicated owner.
        //
        // Regular users — 2-3 per department for realistic seeding.

        $users = [
            // ── OWNERS ──────────────────────────────────────────────────
            ['name' => 'BCG Owner',    'email' => 'owner.bcg@inventory.test',   'department' => 'BCG'],
            ['name' => 'HEDD Owner',   'email' => 'owner.hedd@inventory.test',  'department' => 'HEDD'],
            ['name' => 'IT Owner',     'email' => 'owner.it@inventory.test',    'department' => 'IT'],
            ['name' => 'MISC Owner',   'email' => 'owner.misc@inventory.test',  'department' => 'MISC'],
            // This owner is responsible for both MP and BCG departments
            ['name' => 'MP-BCG Owner', 'email' => 'owner.mp.bcg@inventory.test','department' => 'MP'],

            // ── IT DEPARTMENT ────────────────────────────────────────────
            ['name' => 'IT Tech 1',    'email' => 'it1@inventory.test',         'department' => 'IT'],
            ['name' => 'IT Tech 2',    'email' => 'it2@inventory.test',         'department' => 'IT'],
            ['name' => 'IT Tech 3',    'email' => 'it3@inventory.test',         'department' => 'IT'],

            // ── BCG DEPARTMENT ───────────────────────────────────────────
            ['name' => 'BCG Agent 1',  'email' => 'bcg1@inventory.test',        'department' => 'BCG'],
            ['name' => 'BCG Agent 2',  'email' => 'bcg2@inventory.test',        'department' => 'BCG'],
            ['name' => 'BCG Agent 3',  'email' => 'bcg3@inventory.test',        'department' => 'BCG'],

            // ── HEDD DEPARTMENT ──────────────────────────────────────────
            ['name' => 'HEDD Staff 1', 'email' => 'hedd1@inventory.test',       'department' => 'HEDD'],
            ['name' => 'HEDD Staff 2', 'email' => 'hedd2@inventory.test',       'department' => 'HEDD'],

            // ── MP DEPARTMENT ────────────────────────────────────────────
            ['name' => 'MP Staff 1',   'email' => 'mp1@inventory.test',         'department' => 'MP'],
            ['name' => 'MP Staff 2',   'email' => 'mp2@inventory.test',         'department' => 'MP'],

            // ── MISC DEPARTMENT ──────────────────────────────────────────
            ['name' => 'MISC Staff 1', 'email' => 'misc1@inventory.test',       'department' => 'MISC'],
            ['name' => 'MISC Staff 2', 'email' => 'misc2@inventory.test',       'department' => 'MISC'],
        ];

        foreach ($users as $user) {
            $deptId = DB::table('departments')->where('name', $user['department'])->value('id');

            DB::table('users')->insertOrIgnore([
                'department_id' => $deptId,
                'name'          => $user['name'],
                'email'         => $user['email'],
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }
}
