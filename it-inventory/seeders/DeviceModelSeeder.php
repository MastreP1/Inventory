<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviceModelSeeder extends Seeder
{
    public function run(): void
    {
        // [manufacturer_name, device_type_name, model_name]
        $models = [
            // Laptops
            ['Dell',   'Laptop', 'Latitude 5540'],
            ['Dell',   'Laptop', 'XPS 15'],
            ['HP',     'Laptop', 'EliteBook 840 G10'],
            ['HP',     'Laptop', 'ProBook 450 G9'],
            ['Lenovo', 'Laptop', 'ThinkPad T14'],
            ['Lenovo', 'Laptop', 'IdeaPad 3'],
            ['ASUS',   'Laptop', 'VivoBook 15'],
            ['MSI',    'Laptop', 'Modern 14'],
            // Mini Towers
            ['Dell',   'Mini Tower', 'OptiPlex 3080 MFF'],
            ['HP',     'Mini Tower', 'EliteDesk 800 G6 Mini'],
            ['Lenovo', 'Mini Tower', 'ThinkCentre M90n'],
            // Towers
            ['Dell',   'Tower', 'OptiPlex 7090 Tower'],
            ['HP',     'Tower', 'EliteDesk 800 G6 Tower'],
            // Servers
            ['Dell',   'Server', 'PowerEdge R740'],
            ['HP',     'Server', 'ProLiant DL380 Gen10'],
            // Monitors
            ['Dell',   'Monitor', 'UltraSharp U2722D'],
            ['Samsung','Monitor', 'Odyssey G5'],
            ['HP',     'Monitor', 'E24 G4'],
            // Printers
            ['HP',     'Printer', 'LaserJet Pro M404n'],
            ['Canon',  'Printer', 'imageCLASS MF445dw'],
            ['Brother','Printer', 'HL-L2350DW'],
            ['Epson',  'Printer', 'EcoTank ET-2800'],
            // Hard Drives
            ['Seagate',          'Hard Drive', 'Barracuda 1TB HDD'],
            ['Western Digital',  'Hard Drive', 'Blue 500GB SSD'],
            ['Kingston',         'Hard Drive', 'A2000 500GB NVMe'],
            ['Samsung',          'Hard Drive', '970 EVO Plus 1TB NVMe'],
            // Cartridges
            ['HP',     'Cartridge', 'HP 85A Black LaserJet'],
            ['Canon',  'Cartridge', 'Canon 054 Black'],
            ['Brother','Cartridge', 'TN-2420 Black'],
            ['Epson',  'Cartridge', 'T502 Black Inkjet'],
        ];

        foreach ($models as [$manufacturerName, $typeName, $modelName]) {
            $manufacturerId = DB::table('manufacturers')->where('name', $manufacturerName)->value('id');
            $typeId         = DB::table('device_types')->where('name', $typeName)->value('id');

            if (!$manufacturerId || !$typeId) continue;

            DB::table('device_models')->insertOrIgnore([
                'manufacturer_id' => $manufacturerId,
                'device_type_id'  => $typeId,
                'name'            => $modelName,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }
    }
}
