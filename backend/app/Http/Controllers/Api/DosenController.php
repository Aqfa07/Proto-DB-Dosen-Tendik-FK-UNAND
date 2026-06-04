<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Dosen;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\DosenExport;
use App\Imports\DosenImport;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\Cache;

class DosenController extends Controller
{
    public function index(Request $request)
    {
        $query = Dosen::query()
            ->select('id', 'nama_lengkap', 'nip', 'nidn', 'nidk', 'kategori_dosen', 'pangkat', 'golongan', 'departemen_bagian', 'user_id', 'created_by', 'updated_by', 'deleted_at', 'tanggal_lahir', 'jabatan_fungsional');

        if ($request->has('search')) {
            $search = strtolower($request->search);
            $query->where(function($q) use ($search) {
                $q->whereRaw('LOWER(nama_lengkap) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(nip) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(nidn) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(nidk) LIKE ?', ["%{$search}%"]);
            });
        }

        if ($request->has('departemen_bagian')) {
            $query->where('departemen_bagian', $request->departemen_bagian);
        }

        if ($request->has('kategori_dosen')) {
            $query->where('kategori_dosen', $request->kategori_dosen);
        }

        return response()->json($query->orderBy('nama_lengkap')->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Identitas Pribadi
            'nama_lengkap'          => 'required|string|max:150',
            'jenis_kelamin'         => 'required|in:L,P',
            'tempat_lahir'          => 'required|string|max:100',
            'tanggal_lahir'         => 'required|date',
            // Kepegawaian & ID
            'nip'                   => 'nullable|string|max:50',
            'nidn'                  => 'nullable|string|max:50',
            'nuptk'                 => 'nullable|string|max:50',
            'nidk'                  => 'nullable|string|max:50',
            'tmt_nidk_terbit'       => 'nullable|date',
            'unit_kerja'            => 'nullable|string|max:200',
            'tmt_cpns'              => 'nullable|date',
            'tmt_pensiun'           => 'nullable|date',
            // Kepangkatan & Jabatan
            'pangkat'               => 'nullable|string|max:100',
            'golongan'              => 'nullable|string|max:50',
            'tmt_pangkat'           => 'nullable|date',
            'masa_kerja_pangkat'    => 'nullable|string|max:100',
            'jabatan_fungsional'    => 'nullable|string|max:100',
            'tmt_fungsional'        => 'nullable|date',
            'masa_kerja_fungsional' => 'nullable|string|max:100',
            'masa_kerja_keseluruhan'=> 'nullable|string|max:100',
            // Akademik
            'departemen_bagian'     => 'nullable|string|max:150',
            'home_base'             => 'nullable|string|max:150',
            'pendidikan_terakhir'   => 'nullable|string|max:100',
            'bidang_keahlian'       => 'nullable|string|max:150',
            'tahun_lulus'           => 'nullable|integer',
            'tingkat_pendidik'      => 'nullable|integer',
            // Kategori
            'kategori_dosen'        => 'required|in:Dosen NIDN,Dosen NIDK',
        ]);

        // === UPSERT LOGIC ===
        // Tentukan unique key: prioritaskan NIP, lalu NIDN, lalu NIDK
        $uniqueKey   = null;
        $uniqueValue = null;

        if (!empty($validated['nip'])) {
            $uniqueKey   = 'nip';
            $uniqueValue = $validated['nip'];
        } elseif (!empty($validated['nidn'])) {
            $uniqueKey   = 'nidn';
            $uniqueValue = $validated['nidn'];
        } elseif (!empty($validated['nidk'])) {
            $uniqueKey   = 'nidk';
            $uniqueValue = $validated['nidk'];
        }

        if ($uniqueKey) {
            // Cari data yang sudah ada (termasuk soft-deleted)
            $existing = Dosen::withTrashed()->where($uniqueKey, $uniqueValue)->first();

            if ($existing) {
                // Restore jika sedang soft-deleted
                if ($existing->trashed()) {
                    $existing->restore();
                }
                $validated['updated_by'] = $request->user()->id;
                $existing->update($validated);
                
                // Clear dashboard cache
                Cache::forget('dashboard_metrics');
                
                ActivityLogger::log('UPDATE', "Memperbarui (upsert) data dosen: {$existing->nama_lengkap}", $request);
                return response()->json(['message' => 'Data dosen diperbarui (sudah ada).', 'data' => $existing->fresh(), 'action' => 'updated'], 200);
            }
        }

        // Data belum ada → Insert baru
        $validated['created_by'] = $request->user()->id;
        $dosen = Dosen::create($validated);
        
        // Clear dashboard cache
        Cache::forget('dashboard_metrics');
        
        ActivityLogger::log('CREATE', "Menambahkan data dosen: {$dosen->nama_lengkap}", $request);
        return response()->json(['message' => 'Data dosen baru berhasil ditambahkan.', 'data' => $dosen, 'action' => 'created'], 201);
    }

    public function show(Dosen $dosen)
    {
        return response()->json($dosen);
    }

    public function update(Request $request, Dosen $dosen)
    {
        $validated = $request->validate([
            'nama_lengkap'          => 'sometimes|string|max:150',
            'jenis_kelamin'         => 'sometimes|in:L,P',
            'tempat_lahir'          => 'sometimes|string|max:100',
            'tanggal_lahir'         => 'sometimes|date',
            'nip'                   => 'nullable|string|max:50',
            'nidn'                  => 'nullable|string|max:50',
            'nuptk'                 => 'nullable|string|max:50',
            'nidk'                  => 'nullable|string|max:50',
            'tmt_nidk_terbit'       => 'nullable|date',
            'unit_kerja'            => 'nullable|string|max:200',
            'tmt_cpns'              => 'nullable|date',
            'tmt_pensiun'           => 'nullable|date',
            'pangkat'               => 'nullable|string|max:100',
            'golongan'              => 'nullable|string|max:50',
            'tmt_pangkat'           => 'nullable|date',
            'masa_kerja_pangkat'    => 'nullable|string|max:100',
            'jabatan_fungsional'    => 'nullable|string|max:100',
            'tmt_fungsional'        => 'nullable|date',
            'masa_kerja_fungsional' => 'nullable|string|max:100',
            'masa_kerja_keseluruhan'=> 'nullable|string|max:100',
            'departemen_bagian'     => 'nullable|string|max:150',
            'home_base'             => 'nullable|string|max:150',
            'pendidikan_terakhir'   => 'nullable|string|max:100',
            'bidang_keahlian'       => 'nullable|string|max:150',
            'tahun_lulus'           => 'nullable|integer',
            'tingkat_pendidik'      => 'nullable|integer',
            'kategori_dosen'        => 'sometimes|in:Dosen NIDN,Dosen NIDK',
        ]);

        $validated['updated_by'] = $request->user()->id;
        $dosen->update($validated);
        
        // Clear dashboard cache
        Cache::forget('dashboard_metrics');
        
        ActivityLogger::log('UPDATE', "Memperbarui data dosen: {$dosen->nama_lengkap}", $request);
        return response()->json($dosen->fresh());
    }

    public function destroy(Request $request, Dosen $dosen)
    {
        $nama = $dosen->nama_lengkap;
        $dosen->delete();
        
        // Clear dashboard cache
        Cache::forget('dashboard_metrics');
        
        ActivityLogger::log('DELETE', "Menghapus data dosen: {$nama}", $request);
        return response()->json(['message' => 'Data DOSEN berhasil dihapus soft-delete'], 200);
    }

    public function export()
    {
        return Excel::download(new DosenExport, 'data-dosen-fkunand.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            // Deteksi status dosen dari nama file
            $filename = strtoupper($request->file('file')->getClientOriginalName());
            $kategori = 'Dosen NIDN'; // default
            if (str_contains($filename, 'NIDK')) {
                $kategori = 'Dosen NIDK';
            }

            $countBefore = Dosen::count();
            Excel::import(new DosenImport($kategori), $request->file('file'));
            $countAfter = Dosen::count();
            $imported = $countAfter - $countBefore;

            ActivityLogger::log('CREATE', "Mengimpor {$imported} data dosen ({$kategori}) dari file Excel: {$request->file('file')->getClientOriginalName()}", $request);

            // Clear dashboard cache
            Cache::forget('dashboard_metrics');

            return response()->json([
                'message'  => "Berhasil mengimpor {$imported} data dosen ({$kategori})!",
                'imported' => $imported,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengimpor data: ' . $e->getMessage()], 500);
        }
    }
}
