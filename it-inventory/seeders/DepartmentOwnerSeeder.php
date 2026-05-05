<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentOwnerSeeder extends Seeder
{
    public function run(): void
    {
        // Maps department_name → [owner_emails]
        // MP-BCG Owner owns both MP and BCG — demonstrates the many-to-many pivot.
        $assignments = [
            'BCG'  => ['owner.bcg@inventory.test', 'owner.mp.bcg@inventory.test'],
            'HEDD' => ['owner.hedd@inventory.test'],
            'IT'   => ['owner.it@inventory.test'],
            'MISC' => ['owner.misc@inventory.test'],
            'MP'   => ['owner.mp.bcg@inventory.test'],
        ];

        foreach ($assignments as $deptName => $ownerEmails) {
            $deptId = DB::table('departments')->where('name', $deptName)->value('id');
            if (!$deptId) continue;

            foreach ($ownerEmails as $email) {
                $userId = DB::table('users')->where('email', $email)->value('id');
                if (!$userId) continue;

                DB::table('department_owners')->insertOrIgnore([
                    'department_id' => $deptId,
                    'user_id'       => $userId,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        }
    }
}
