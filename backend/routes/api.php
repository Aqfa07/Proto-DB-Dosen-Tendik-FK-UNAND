<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DosenController;
use App\Http\Controllers\Api\TendikController;
use App\Http\Controllers\Api\SnapshotController;
use App\Http\Controllers\Api\KpiDekanController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ActivityLogController;

// SPA Authentication Routes (Stateless API Token)
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/password', [AuthController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard/metrics', [DashboardController::class, 'getMetrics']);

    // Dosen CRUD & Export/Import
    Route::get('/dosens/export', [DosenController::class, 'export']);
    Route::post('/dosens/import', [DosenController::class, 'import']);
    Route::apiResource('dosens', DosenController::class);

    // Tendik CRUD & Export/Import
    Route::get('/tendiks/export', [TendikController::class, 'export']);
    Route::post('/tendiks/import', [TendikController::class, 'import']);
    Route::apiResource('tendiks', TendikController::class);

    // Snapshots
    Route::post('/snapshots/finalize', [SnapshotController::class, 'finalizeQuarter']);
    Route::get('/snapshots/{snapshot}/dosen', [SnapshotController::class, 'dosenHistory']);
    Route::apiResource('snapshots', SnapshotController::class)->only(['index', 'show']);

    // KPI Capaian Kinerja Dekan
    Route::get('/kpi', [KpiDekanController::class, 'index']);
    Route::post('/kpi', [KpiDekanController::class, 'store']);
    Route::put('/kpi/{id}', [KpiDekanController::class, 'update']);
    Route::delete('/kpi/{id}', [KpiDekanController::class, 'destroy']);

    // Manajemen User
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
    Route::patch('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);

    // Activity Log (Admin Read-only)
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
});
