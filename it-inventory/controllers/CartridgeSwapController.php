<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\CartridgeAssignment;
use App\Models\CartridgeSwap;
use App\Models\CartridgeStatus;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartridgeSwapController extends Controller
{
    public function __construct(protected DeviceLogService $logger) {}

    public function index()
    {
        return CartridgeSwap::with([
            'printer',
            'oldCartridge.cartridge',
            'newCartridge.cartridge',
        ])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'printer_id'       => 'required|exists:devices,id',
            'new_cartridge_id' => 'required|exists:devices,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $printer      = Device::with(['printer'])->findOrFail($validated['printer_id']);
            $newCartridge = Device::with(['cartridge', 'cartridgeStatus'])->findOrFail($validated['new_cartridge_id']);

            if ($printer->category !== 'printer') {
                return response()->json(['message' => "Device [{$printer->label}] is not a printer."], 422);
            }
            if ($newCartridge->category !== 'cartridge') {
                return response()->json(['message' => "Device [{$newCartridge->label}] is not a cartridge."], 422);
            }

            $newInkType  = $newCartridge->cartridge?->ink_type;
            $printerType = $printer->printer?->printer_type;
            if ($newInkType && $printerType && $newInkType !== $printerType) {
                return response()->json([
                    'message' => "Ink type mismatch: cartridge is [{$newInkType}] but printer is [{$printerType}].",
                ], 422);
            }

            $alreadyIn = CartridgeAssignment::where('cartridge_id', $newCartridge->id)
                ->whereNull('end_date')->exists();
            if ($alreadyIn) {
                return response()->json([
                    'message' => "Cartridge [{$newCartridge->label}] is already installed in another printer.",
                ], 422);
            }

            if ($newCartridge->cartridgeStatus && !$newCartridge->cartridgeStatus->is_assignable) {
                return response()->json([
                    'message' => "Cartridge [{$newCartridge->label}] has status [{$newCartridge->cartridgeStatus->name}] which is not assignable.",
                ], 422);
            }

            // Remove old cartridge
            $oldAssignment = CartridgeAssignment::where('printer_id', $printer->id)
                ->whereNull('end_date')->first();

            $oldCartridgeId = null;
            if ($oldAssignment) {
                $oldCartridgeId = $oldAssignment->cartridge_id;
                $oldAssignment->update(['end_date' => now()]);

                $emptyStatus = CartridgeStatus::where('name', 'Empty')->first();
                if ($emptyStatus) {
                    Device::where('id', $oldCartridgeId)
                        ->update(['cartridge_status_id' => $emptyStatus->id]);
                }
            }

            // Install new cartridge
            CartridgeAssignment::create([
                'cartridge_id' => $newCartridge->id,
                'printer_id'   => $printer->id,
                'start_date'   => now(),
            ]);

            $swap = CartridgeSwap::create([
                'printer_id'       => $printer->id,
                'old_cartridge_id' => $oldCartridgeId,
                'new_cartridge_id' => $newCartridge->id,
                'swapped_at'       => now(),
            ]);

            $this->logger->log($printer->id, 'cartridge_swapped', [
                'old_cartridge_id'    => $oldCartridgeId,
                'new_cartridge_id'    => $newCartridge->id,
                'new_cartridge_label' => $newCartridge->label,
            ]);
            $this->logger->log($newCartridge->id, 'cartridge_swapped', [
                'printer_id'            => $printer->id,
                'printer_label'         => $printer->label,
                'replaced_cartridge_id' => $oldCartridgeId,
            ]);
            if ($oldCartridgeId) {
                $this->logger->log($oldCartridgeId, 'cartridge_swapped', [
                    'printer_id'        => $printer->id,
                    'printer_label'     => $printer->label,
                    'replaced_by_id'    => $newCartridge->id,
                    'replaced_by_label' => $newCartridge->label,
                ]);
            }

            return response()->json(
                $swap->load(['printer', 'oldCartridge.cartridge', 'newCartridge.cartridge']),
                201
            );
        });
    }

    public function destroy($id)
    {
        CartridgeSwap::findOrFail($id)->delete();
        return response()->json(['message' => 'Cartridge swap record deleted.']);
    }

    public function printerCartridgeSwaps($id)
    {
        return CartridgeSwap::where('printer_id', $id)
            ->with(['printer', 'oldCartridge.cartridge', 'newCartridge.cartridge'])
            ->latest()->get();
    }
}
