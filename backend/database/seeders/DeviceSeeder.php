<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        $model      = fn($name) => DB::table('device_models')->where('name', $name)->value('id');
        $type       = fn($name) => DB::table('device_types')->where('name', $name)->value('id');
        $status     = fn($name) => DB::table('statuses')->where('name', $name)->value('id');
        $driveStatus= fn($name) => DB::table('drive_statuses')->where('name', $name)->value('id');
        $cartStatus = fn($name) => DB::table('cartridge_statuses')->where('name', $name)->value('id');
        $location   = fn($name) => DB::table('locations')->where('name', $name)->value('id');
        $department = fn($name) => DB::table('departments')->where('name', $name)->value('id');
        $user       = fn($email) => DB::table('users')->where('email', $email)->value('id');
        $mfr        = fn($name) => DB::table('manufacturers')->where('name', $name)->value('id');

        // ── COMPUTERS ────────────────────────────────────────────────────
        $computers = [
            [
                'label'          => 'LAP-001',
                'serial_number'  => 'SN-LAP-001',
                'device_type_id' => $type('Laptop'),
                'category'       => 'computer',
                'manufacturer_id'=> $mfr('Lenovo'),
                'device_model_id'=> $model('ThinkPad T14'),
                'status_id'      => $status('In Service'),
                'location_id'    => $location('IT Office'),
                'department_id'  => $department('IT'),
                'user_id'        => $user('it1@inventory.test'),
                'comment'        => 'Primary laptop IT Tech 1',
                'computer'       => ['cpu' => 'Intel Core i5-1235U', 'ram' => '16GB DDR4'],
            ],
            [
                'label'          => 'LAP-002',
                'serial_number'  => 'SN-LAP-002',
                'device_type_id' => $type('Laptop'),
                'category'       => 'computer',
                'manufacturer_id'=> $mfr('Dell'),
                'device_model_id'=> $model('Latitude 5540'),
                'status_id'      => $status('Reserved'),
                'location_id'    => $location('IT Office'),
                'department_id'  => $department('IT'),
                'user_id'        => null,
                'comment'        => 'Spare laptop',
                'computer'       => ['cpu' => null, 'ram' => null],
            ],
            [
                'label'          => 'DSK-001',
                'serial_number'  => 'SN-DSK-001',
                'device_type_id' => $type('Mini Tower'),
                'category'       => 'computer',
                'manufacturer_id'=> $mfr('HP'),
                'device_model_id'=> $model('EliteDesk 800 G6 Mini'),
                'status_id'      => $status('In Service'),
                'location_id'    => $location('Open Space'),
                'department_id'  => $department('BCG'),
                'user_id'        => $user('bcg1@inventory.test'),
                'comment'        => null,
                'computer'       => ['cpu' => 'Intel Core i7-10700', 'ram' => '32GB DDR4'],
            ],
        ];

        foreach ($computers as $data) {
            $computerData = $data['computer'];
            unset($data['computer']);

            $deviceId = DB::table('devices')->insertGetId(array_merge($data, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            DB::table('computers')->insertOrIgnore(array_merge(
                ['device_id' => $deviceId],
                $computerData,
                ['created_at' => now(), 'updated_at' => now()]
            ));
        }

        // ── PRINTERS ─────────────────────────────────────────────────────
        $printers = [
            [
                'label'          => 'PRN-001',
                'serial_number'  => 'SN-PRN-001',
                'device_type_id' => $type('Printer'),
                'category'       => 'printer',
                'manufacturer_id'=> $mfr('HP'),
                'device_model_id'=> $model('LaserJet Pro M404n'),
                'status_id'      => $status('In Service'),
                'location_id'    => $location('HR Office'),
                'department_id'  => $department('HEDD'),
                'user_id'        => null,
                'comment'        => 'Shared HR printer',
                'printer'        => ['printer_type' => 'laser', 'duplex' => true, 'color_support' => false],
            ],
            [
                'label'          => 'PRN-002',
                'serial_number'  => 'SN-PRN-002',
                'device_type_id' => $type('Printer'),
                'category'       => 'printer',
                'manufacturer_id'=> $mfr('Epson'),
                'device_model_id'=> $model('EcoTank ET-2800'),
                'status_id'      => $status('Reserved'),
                'location_id'    => $location('IT Office'),
                'department_id'  => $department('IT'),
                'user_id'        => null,
                'comment'        => 'Inkjet printer for labels',
                'printer'        => ['printer_type' => 'inkjet', 'duplex' => false, 'color_support' => true],
            ],
        ];

        foreach ($printers as $data) {
            $printerData = $data['printer'];
            unset($data['printer']);

            $deviceId = DB::table('devices')->insertGetId(array_merge($data, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            DB::table('printers')->insertOrIgnore(array_merge(
                ['device_id' => $deviceId],
                $printerData,
                ['created_at' => now(), 'updated_at' => now()]
            ));
        }

        // ── MONITORS ─────────────────────────────────────────────────────
        $monitors = [
            [
                'label'          => 'MON-001',
                'serial_number'  => 'SN-MON-001',
                'device_type_id' => $type('Monitor'),
                'category'       => 'monitor',
                'manufacturer_id'=> $mfr('Dell'),
                'device_model_id'=> $model('UltraSharp U2722D'),
                'status_id'      => $status('In Service'),
                'location_id'    => $location('IT Office'),
                'department_id'  => $department('IT'),
                'user_id'        => $user('it1@inventory.test'),
                'comment'        => null,
                'monitor'        => ['panel_type' => 'IPS', 'size_inches' => 27.0, 'video_inputs' => ['HDMI', 'DisplayPort']],
            ],
            [
                'label'          => 'MON-002',
                'serial_number'  => 'SN-MON-002',
                'device_type_id' => $type('Monitor'),
                'category'       => 'monitor',
                'manufacturer_id'=> $mfr('Samsung'),
                'device_model_id'=> $model('Odyssey G5'),
                'status_id'      => $status('Reserved'),
                'location_id'    => $location('IT Office'),
                'department_id'  => $department('IT'),
                'user_id'        => null,
                'comment'        => 'Spare monitor',
                'monitor'        => ['panel_type' => null, 'size_inches' => null, 'video_inputs' => null],
            ],
        ];

        foreach ($monitors as $data) {
            $monitorData = $data['monitor'];
            unset($data['monitor']);

            $deviceId = DB::table('devices')->insertGetId(array_merge($data, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            DB::table('monitors')->insertOrIgnore(array_merge(
                ['device_id' => $deviceId],
                ['video_inputs' => $monitorData['video_inputs'] ? json_encode($monitorData['video_inputs']) : null],
                ['panel_type' => $monitorData['panel_type'], 'size_inches' => $monitorData['size_inches']],
                ['created_at' => now(), 'updated_at' => now()]
            ));
        }

        // ── HARD DRIVES ───────────────────────────────────────────────────
        $hardDrives = [
            [
                'label'               => 'HDD-001',
                'serial_number'       => 'SN-HDD-001',
                'device_type_id'      => $type('Hard Drive'),
                'category'            => 'hard_drive',
                'manufacturer_id'     => $mfr('Seagate'),
                'device_model_id'     => $model('Barracuda 1TB HDD'),
                'drive_status_id'     => $driveStatus('Available'),
                'location_id'         => $location('IT Office'),
                'department_id'       => $department('IT'),
                'comment'             => 'Spare drive in storage',
                'hard_drive'          => ['drive_type' => 'HDD', 'capacity_gb' => 1000],
            ],
            [
                'label'               => 'SSD-001',
                'serial_number'       => 'SN-SSD-001',
                'device_type_id'      => $type('Hard Drive'),
                'category'            => 'hard_drive',
                'manufacturer_id'     => $mfr('Samsung'),
                'device_model_id'     => $model('970 EVO Plus 1TB NVMe'),
                'drive_status_id'     => $driveStatus('Available'),
                'location_id'         => $location('IT Office'),
                'department_id'       => $department('IT'),
                'comment'             => null,
                'hard_drive'          => ['drive_type' => 'NVMe', 'capacity_gb' => 1000],
            ],
        ];

        foreach ($hardDrives as $data) {
            $driveData = $data['hard_drive'];
            unset($data['hard_drive']);
            // Ensure status FKs not set for wrong category
            $data['status_id'] = null;
            $data['cartridge_status_id'] = null;
            $data['user_id'] = null;

            $deviceId = DB::table('devices')->insertGetId(array_merge($data, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            DB::table('hard_drives')->insertOrIgnore(array_merge(
                ['device_id' => $deviceId],
                $driveData,
                ['created_at' => now(), 'updated_at' => now()]
            ));
        }

        // ── CARTRIDGES ────────────────────────────────────────────────────
        $cartridges = [
            [
                'label'                => 'CART-001',
                'serial_number'        => 'SN-CART-001',
                'device_type_id'       => $type('Cartridge'),
                'category'             => 'cartridge',
                'manufacturer_id'      => $mfr('HP'),
                'device_model_id'      => $model('HP 85A Black LaserJet'),
                'cartridge_status_id'  => $cartStatus('Full'),
                'location_id'          => $location('IT Office'),
                'department_id'        => $department('IT'),
                'comment'              => 'New cartridge for PRN-001',
                'cartridge'            => ['ink_type' => 'laser', 'printer_compatibility' => 'HP 85A'],
            ],
            [
                'label'                => 'CART-002',
                'serial_number'        => 'SN-CART-002',
                'device_type_id'       => $type('Cartridge'),
                'category'             => 'cartridge',
                'manufacturer_id'      => $mfr('Epson'),
                'device_model_id'      => $model('T502 Black Inkjet'),
                'cartridge_status_id'  => $cartStatus('Full'),
                'location_id'          => $location('IT Office'),
                'department_id'        => $department('IT'),
                'comment'              => 'Spare inkjet cartridge',
                'cartridge'            => ['ink_type' => 'inkjet', 'printer_compatibility' => 'Epson T502'],
            ],
        ];

        foreach ($cartridges as $data) {
            $cartData = $data['cartridge'];
            unset($data['cartridge']);
            $data['status_id'] = null;
            $data['drive_status_id'] = null;
            $data['user_id'] = null;

            $deviceId = DB::table('devices')->insertGetId(array_merge($data, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            DB::table('cartridges')->insertOrIgnore(array_merge(
                ['device_id' => $deviceId],
                $cartData,
                ['created_at' => now(), 'updated_at' => now()]
            ));
        }
    }
}
