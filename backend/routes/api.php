<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\StatController;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    
    // Dashboard statistics (admin & staff)
    Route::get('/dashboard/stats', [StatController::class, 'getStats']);

    // Visitor-related routes (admin & staff)
    Route::middleware('role:admin,staff')->group(function () {
        Route::post('/visitors', [VisitorController::class, 'store']); // Register visitor
        Route::get('/visitors', [VisitorController::class, 'index']);  // View all visitors
    });

    // Admin-only routes
    Route::middleware('role:admin')->group(function () {
        Route::put('/visitors/{visitor}', [VisitorController::class, 'update']); // Update visitor
        Route::delete('/visitors/{visitor}', [VisitorController::class, 'destroy']); // Delete visitor
    });
});

// Public visitor check-in routes (No authentication required)
Route::prefix('/visitors')->group(function () {
    Route::get('/{code}', [VisitorController::class, 'show']); // Check visitor details
    Route::post('/check-in', [VisitorController::class, 'checkIn']); // Check-in visitor
});
