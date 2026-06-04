<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogger
{
    /**
     * Rekam sebuah aksi ke tabel activity_logs.
     *
     * @param string $action   Jenis aksi: CREATE, UPDATE, DELETE, DEACTIVATE, LOGIN, etc.
     * @param string $description Deskripsi aktivitas yang dilakukan.
     * @param Request|null $request  Objek request untuk mengambil user_id dan ip_address.
     */
    public static function log(string $action, string $description, ?Request $request = null): void
    {
        ActivityLog::create([
            'user_id'    => $request?->user()?->id,
            'action'     => strtoupper($action),
            'description' => $description,
            'ip_address' => $request?->ip(),
        ]);
    }
}
