<?php

namespace App\Http\Controllers;
use Illuminate\Routing\Controller;
use App\Models\Device;
use App\Models\CartridgeAssignment;
use App\Models\CartridgeStatus;
use App\Services\DeviceLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartridgeAssignmentController extends Controller
{
    public function __construct(protected DeviceLogService $logger) {}

    public function index()
    {
        return CartridgeAssignment::with([
            'cartridge.cartridge',
            'printer.printer',
        ])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cartridge_id' => 'required|exists:devices,id',
            'printer_id'   => 'required|exists:devices,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $cartridge = Device::with(['cartridge', 'cartridgeStatus'])->findOrFail($validated['cartridge_id']);
            $printer   = Device::with(['printer'])->findOrFail($validated['printer_id']);

            if ($cartridge->category !== 'cartridge') {
                return response()->json(['message' => "Device [{$cartridge->label}] is not a cartridge."], 422);
            }
            if ($printer->category !== 'printer') {
                return response()->json(['message' => "Device [{$printer->label}] is not a printer."], 422);
            }

            // Ink type compatibility
            $inkType     = $cartridge->cartridge?->ink_type;
            $printerType = $printer->printer?->printer_type;
            if ($inkType && $printerType && $inkType !== $printerType) {
                return response()->json([
                    'message' => "Ink type mismatch: cartridge is [{$inkType}] but printer is [{$printerType}].",
                ], 422);
            }

            // Cartridge must not already be installed
            $alreadyIn = CartridgeAssignment::where('cartridge_id', $cartridge->id)
                ->whereNull('end_date')->first();
            if ($alreadyIn) {
                return response()->json([
                    'message' => "Cartridge [{$cartridge->label}] is already installed in printer ID [{$alreadyIn->printer_id}].",
                ], 422);
            }

            if ($cartridge->cartridgeStatus && !$cartridge->cartridgeStatus->is_assignable) {
                return response()->json([
                    'message' => "Cartridge [{$cartridge->label}] has status [{$cartridge->cartridgeStatus->name}] which is not assignable.",
                ], 422);
            }

            // Close existing printer cartridge if any
            CartridgeAssignment::where('printer_id', $printer->id)
                ->whereNull('end_date')
                ->update(['end_date' => now()]);

            $assignment = CartridgeAssignment::create([
                'cartridge_id' => $cartridge->id,
                'printer_id'   => $printer->id,
                'start_date'   => now(),
            ]);

            $this->logger->log($cartridge->id, 'cartridge_assigned', [
                'printer_id'    => $printer->id,
                'printer_label' => $printer->label,
                'assignment_id' => $assignment->id,
            ]);
            $this->logger->log($printer->id, 'cartridge_assigned', [
                'cartridge_id'    => $cartridge->id,
                'cartridge_label' => $cartridge->label,
                'assignment_id'   => $assignment->id,
            ]);

            return response()->json($assignment->load(['cartridge', 'printer']), 201);
        });
    }

    public function end($id)
    {
        return DB::transaction(function () use ($id) {
            $assignment = CartridgeAssignment::with(['cartridge', 'printer'])->findOrFail($id);

            if ($assignment->end_date) {
                return response()->json(['message' => 'Assignment is already ended.'], 422);
            }

            $assignment->update(['end_date' => now()]);

            $this->logger->log($assignment->cartridge_id, 'cartridge_unassigned', [
                'printer_id'    => $assignment->printer_id,
                'printer_label' => $assignment->printer?->label,
            ]);
            $this->logger->log($assignment->printer_id, 'cartridge_unassigned', [
                'cartridge_id'    => $assignment->cartridge_id,
                'cartridge_label' => $assignment->cartridge?->label,
            ]);

            return response()->json(['message' => 'Cartridge removed from printer.']);
        });
    }

    public function destroy($id)
    {
        $assignment = CartridgeAssignment::findOrFail($id);
        $assignment->delete();
        return response()->json(['message' => 'Cartridge assignment record deleted.']);
    }

    public function deviceCartridgeAssignments($id)
    {
        $device = Device::findOrFail($id);

        if ($device->category === 'cartridge') {
            return CartridgeAssignment::where('cartridge_id', $id)
                ->with('printer')->latest()->get();
        }
        if ($device->category === 'printer') {
            return CartridgeAssignment::where('printer_id', $id)
                ->with('cartridge.cartridge')->latest()->get();
        }

        return response()->json(['message' => 'Device is not a printer or cartridge.'], 422);
    }
}
