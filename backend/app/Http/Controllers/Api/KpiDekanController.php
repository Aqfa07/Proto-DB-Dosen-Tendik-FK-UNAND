<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KpiDekan;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;

class KpiDekanController extends Controller
{
    public function index(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));

        $kpis = KpiDekan::where('tahun', $tahun)
            ->orderBy('id')
            ->get();

        // Ringkasan agregat
        $totalTarget = $kpis->sum('target');
        $totalRealisasi = $kpis->sum('total_realisasi');
        $rataCapaian = $kpis->count() > 0 ? round($kpis->avg('persentase_capaian'), 2) : 0;

        return response()->json([
            'tahun' => (int) $tahun,
            'ringkasan' => [
                'jumlah_indikator' => $kpis->count(),
                'total_target' => $totalTarget,
                'total_realisasi' => $totalRealisasi,
                'rata_rata_capaian' => $rataCapaian,
            ],
            'data' => $kpis,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun'     => 'required|integer|min:2020|max:2100',
            'indikator' => 'required|string|max:500',
            'target'    => 'required|numeric|min:0',
        ]);

        $kpi = KpiDekan::create([
            'tahun'     => $request->tahun,
            'indikator' => $request->indikator,
            'target'    => $request->target,
        ]);

        ActivityLogger::log('CREATE', "Menambahkan indikator KPI: \"{$kpi->indikator}\" (Target: {$kpi->target})", $request);

        return response()->json($kpi, 201);
    }

    public function update(Request $request, $id)
    {
        $kpi = KpiDekan::findOrFail($id);

        $request->validate([
            'indikator'    => 'sometimes|string|max:500',
            'target'       => 'sometimes|numeric|min:0',
            'realisasi_q1' => 'sometimes|numeric|min:0',
            'realisasi_q2' => 'sometimes|numeric|min:0',
            'realisasi_q3' => 'sometimes|numeric|min:0',
            'realisasi_q4' => 'sometimes|numeric|min:0',
        ]);

        $kpi->update($request->only([
            'indikator', 'target',
            'realisasi_q1', 'realisasi_q2', 'realisasi_q3', 'realisasi_q4',
        ]));

        ActivityLogger::log('UPDATE', "Memperbarui indikator KPI: \"{$kpi->indikator}\"", $request);

        return response()->json($kpi);
    }

    public function destroy(Request $request, $id)
    {
        $kpi = KpiDekan::findOrFail($id);
        $nama = $kpi->indikator;
        $kpi->delete();

        ActivityLogger::log('DELETE', "Menghapus indikator KPI: \"{$nama}\"", $request);

        return response()->json(['message' => 'Indikator berhasil dihapus.']);
    }
}
