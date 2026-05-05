<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\DeviceAssignmentController;
use App\Http\Controllers\DeviceMovementController;
use App\Http\Controllers\DeviceSwapController;
use App\Http\Controllers\DeviceOwnerSwapController;
use App\Http\Controllers\DeviceLogController;
use App\Http\Controllers\HardDriveAssignmentController;
use App\Http\Controllers\HardDriveSwapController;
use App\Http\Controllers\CartridgeAssignmentController;
use App\Http\Controllers\CartridgeSwapController;
use App\Http\Controllers\LookupController;

/* ══════════════════════════════════════════════════════════════════
 |  REFERENCE TABLES — full add + delete from the app
 ══════════════════════════════════════════════════════════════════ */

// Sites
Route::get   ('/sites',          [LookupController::class, 'sites']);
Route::post  ('/sites',          [LookupController::class, 'storeSite']);
Route::delete('/sites/{id}',     [LookupController::class, 'destroySite']);

// Locations
Route::get   ('/locations',      [LookupController::class, 'locations']);
Route::post  ('/locations',      [LookupController::class, 'storeLocation']);
Route::delete('/locations/{id}', [LookupController::class, 'destroyLocation']);

// Manufacturers
Route::get   ('/manufacturers',      [LookupController::class, 'manufacturers']);
Route::post  ('/manufacturers',      [LookupController::class, 'storeManufacturer']);
Route::delete('/manufacturers/{id}', [LookupController::class, 'destroyManufacturer']);

// Device Types
Route::get   ('/device-types',      [LookupController::class, 'deviceTypes']);
Route::post  ('/device-types',      [LookupController::class, 'storeDeviceType']);
Route::delete('/device-types/{id}', [LookupController::class, 'destroyDeviceType']);

// Device Models
Route::get   ('/device-models',      [LookupController::class, 'deviceModels']);
Route::post  ('/device-models',      [LookupController::class, 'storeDeviceModel']);
Route::delete('/device-models/{id}', [LookupController::class, 'destroyDeviceModel']);

// Statuses (devices)
Route::get   ('/statuses',      [LookupController::class, 'statuses']);
Route::post  ('/statuses',      [LookupController::class, 'storeStatus']);
Route::delete('/statuses/{id}', [LookupController::class, 'destroyStatus']);

// Drive Statuses
Route::get   ('/drive-statuses',      [LookupController::class, 'driveStatuses']);
Route::post  ('/drive-statuses',      [LookupController::class, 'storeDriveStatus']);
Route::delete('/drive-statuses/{id}', [LookupController::class, 'destroyDriveStatus']);

// Cartridge Statuses
Route::get   ('/cartridge-statuses',      [LookupController::class, 'cartridgeStatuses']);
Route::post  ('/cartridge-statuses',      [LookupController::class, 'storeCartridgeStatus']);
Route::delete('/cartridge-statuses/{id}', [LookupController::class, 'destroyCartridgeStatus']);

// Departments
Route::get   ('/departments',                              [LookupController::class, 'departments']);
Route::post  ('/departments',                              [LookupController::class, 'storeDepartment']);
Route::delete('/departments/{id}',                         [LookupController::class, 'destroyDepartment']);
Route::post  ('/departments/{id}/owners',                  [LookupController::class, 'addDepartmentOwner']);
Route::delete('/departments/{id}/owners/{userId}',         [LookupController::class, 'removeDepartmentOwner']);

// Users
Route::get   ('/users',      [LookupController::class, 'users']);
Route::post  ('/users',      [LookupController::class, 'storeUser']);
Route::delete('/users/{id}', [LookupController::class, 'destroyUser']);

/* ══════════════════════════════════════════════════════════════════
 |  DEVICES — full CRUD
 ══════════════════════════════════════════════════════════════════ */
Route::apiResource('devices', DeviceController::class);

/* ══════════════════════════════════════════════════════════════════
 |  USER ASSIGNMENTS (computers / printers / monitors → users)
 ══════════════════════════════════════════════════════════════════ */
Route::get   ('/assignments',              [DeviceAssignmentController::class, 'index']);
Route::post  ('/assignments',             [DeviceAssignmentController::class, 'store']);
Route::put   ('/assignments/{id}/end',    [DeviceAssignmentController::class, 'end']);
Route::delete('/assignments/{id}',        [DeviceAssignmentController::class, 'destroy']);
Route::get   ('/devices/{id}/assignments',[DeviceAssignmentController::class, 'deviceAssignments']);
Route::get   ('/users/{id}/assignments',  [DeviceAssignmentController::class, 'userAssignments']);

/* ══════════════════════════════════════════════════════════════════
 |  HARD DRIVE ASSIGNMENTS (drives → computers)
 ══════════════════════════════════════════════════════════════════ */
Route::get   ('/drive-assignments',               [HardDriveAssignmentController::class, 'index']);
Route::post  ('/drive-assignments',               [HardDriveAssignmentController::class, 'store']);
Route::put   ('/drive-assignments/{id}/end',      [HardDriveAssignmentController::class, 'end']);
Route::delete('/drive-assignments/{id}',          [HardDriveAssignmentController::class, 'destroy']);
Route::get   ('/devices/{id}/drive-assignments',  [HardDriveAssignmentController::class, 'deviceDriveAssignments']);

/* ══════════════════════════════════════════════════════════════════
 |  CARTRIDGE ASSIGNMENTS (cartridges → printers)
 ══════════════════════════════════════════════════════════════════ */
Route::get   ('/cartridge-assignments',              [CartridgeAssignmentController::class, 'index']);
Route::post  ('/cartridge-assignments',              [CartridgeAssignmentController::class, 'store']);
Route::put   ('/cartridge-assignments/{id}/end',     [CartridgeAssignmentController::class, 'end']);
Route::delete('/cartridge-assignments/{id}',         [CartridgeAssignmentController::class, 'destroy']);
Route::get   ('/devices/{id}/cartridge-assignments', [CartridgeAssignmentController::class, 'deviceCartridgeAssignments']);

/* ══════════════════════════════════════════════════════════════════
 |  MOVEMENTS
 ══════════════════════════════════════════════════════════════════ */
Route::get   ('/movements',              [DeviceMovementController::class, 'index']);
Route::post  ('/movements',             [DeviceMovementController::class, 'store']);
Route::delete('/movements/{id}',        [DeviceMovementController::class, 'destroy']);
Route::get   ('/devices/{id}/movements',[DeviceMovementController::class, 'deviceMovements']);

/* ══════════════════════════════════════════════════════════════════
 |  LOCATION SWAPS
 ══════════════════════════════════════════════════════════════════ */
Route::get   ('/swaps',              [DeviceSwapController::class, 'index']);
Route::post  ('/swaps',              [DeviceSwapController::class, 'store']);
Route::delete('/swaps/{id}',         [DeviceSwapController::class, 'destroy']);
Route::get   ('/devices/{id}/swaps', [DeviceSwapController::class, 'deviceSwaps']);

/* ══════════════════════════════════════════════════════════════════
 |  OWNER SWAPS
 ══════════════════════════════════════════════════════════════════ */
Route::get   ('/owner-swaps',              [DeviceOwnerSwapController::class, 'index']);
Route::post  ('/owner-swaps',              [DeviceOwnerSwapController::class, 'store']);
Route::delete('/owner-swaps/{id}',         [DeviceOwnerSwapController::class, 'destroy']);
Route::get   ('/devices/{id}/owner-swaps', [DeviceOwnerSwapController::class, 'deviceOwnerSwaps']);

/* ══════════════════════════════════════════════════════════════════
 |  HARD DRIVE SWAPS
 ══════════════════════════════════════════════════════════════════ */
Route::get   ('/drive-swaps',              [HardDriveSwapController::class, 'index']);
Route::post  ('/drive-swaps',              [HardDriveSwapController::class, 'store']);
Route::delete('/drive-swaps/{id}',         [HardDriveSwapController::class, 'destroy']);
Route::get   ('/devices/{id}/drive-swaps', [HardDriveSwapController::class, 'computerDriveSwaps']);

/* ══════════════════════════════════════════════════════════════════
 |  CARTRIDGE SWAPS
 ══════════════════════════════════════════════════════════════════ */
Route::get   ('/cartridge-swaps',              [CartridgeSwapController::class, 'index']);
Route::post  ('/cartridge-swaps',              [CartridgeSwapController::class, 'store']);
Route::delete('/cartridge-swaps/{id}',         [CartridgeSwapController::class, 'destroy']);
Route::get   ('/devices/{id}/cartridge-swaps', [CartridgeSwapController::class, 'printerCartridgeSwaps']);

/* ══════════════════════════════════════════════════════════════════
 |  AUDIT LOGS (read-only — logs are never manually deleted)
 ══════════════════════════════════════════════════════════════════ */
Route::get('/logs',              [DeviceLogController::class, 'index']);
Route::get('/devices/{id}/logs', [DeviceLogController::class, 'deviceLogs']);
