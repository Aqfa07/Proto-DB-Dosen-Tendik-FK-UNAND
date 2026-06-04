<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Dosen;
use App\Models\Tendik;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function getMetrics(Request $request)
    {
        $cacheData = Cache::remember('dashboard_metrics', 60 * 15, function () {
            $totalDosen = Dosen::count();
            $totalTendik = Tendik::count();
            
            // Sertifikasi placeholder
            $dosenTersertifikasi = Dosen::where('kategori_dosen', 'Dosen NIDN')->count();
            $persentaseSertifikasi = $totalDosen > 0 ? round(($dosenTersertifikasi / $totalDosen) * 100) : 0;

            // Convert to array to avoid serialization issues with Eloquent Collections in some environments
            $pangkatDosen = Dosen::select('pangkat', DB::raw('count(*) as total'))
                ->whereNotNull('pangkat')
                ->groupBy('pangkat')
                ->get()
                ->toArray();

            return [
                'metrics' => [
                    'total_dosen' => $totalDosen,
                    'total_tendik' => $totalTendik,
                    'persentase_sertifikasi_dosen' => $persentaseSertifikasi . '%',
                    'aktivitas_update' => 'Tinggi',
                ],
                'charts' => [
                    'distribusi_pangkat_dosen' => $pangkatDosen,
                ]
            ];
        });

        return response()->json($cacheData);
    }
}
