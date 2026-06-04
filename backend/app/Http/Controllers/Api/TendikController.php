<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tendik;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TendikExport;
use App\Imports\TendikImport;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\Cache;

class TendikController extends Controller
{
    public function index(Request $request)
    {
        $query = Tendik::query()
            ->select('id', 'nama_lengkap', 'nip_baru', 'nama_jabatan', 'department_id', 'user_id', 'created_by', 'updated_by', 'deleted_at', 'tanggal_lahir', 'tanggal_mulai_tugas_unit', 'tanggal_mulai_keseluruhan', 'tanggal_mulai_golongan', 'nama_pendidikan', 'tingkat_ijazah', 'golongan_pangkat', 'tmt_pensiun')
            ->with(['department:id,name', 'user:id,email', 'diklat']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                  ->orWhere('nip_baru', 'ilike', "%{$search}%")
                  ->orWhere('nama_jabatan', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json($query->orderBy('nama_lengkap')->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Identitas Pribadi
            'nama_lengkap'              => 'required|string|max:150',
            'jenis_kelamin'             => 'required|in:L,P',
            'tempat_lahir'              => 'required|string|max:100',
            'tanggal_lahir'             => 'required|date',
            // Kepegawaian
            'nip_baru'                  => 'required|string|max:50',
            'department_id'             => 'nullable|exists:departments,id',
            // Kepangkatan
            'golongan_cpns'             => 'nullable|string|max:20',
            'tmt_cpns'                  => 'nullable|date',
            'golongan_pangkat'          => 'nullable|string|max:20',
            'tmt_pangkat'               => 'nullable|date',
            // Jabatan
            'nama_jabatan'              => 'nullable|string|max:100',
            'tmt_jabatan'               => 'nullable|date',
            // Masa Kerja
            'tanggal_mulai_tugas_unit'  => 'nullable|date',
            'tanggal_mulai_keseluruhan' => 'nullable|date',
            'tanggal_mulai_golongan'    => 'nullable|date',
            // Pendidikan
            'nama_pendidikan'           => 'nullable|string|max:100',
            'tahun_lulus'               => 'nullable|integer',
            'tingkat_ijazah'            => 'nullable|string|max:50',
            // Pensiun
            'tmt_pensiun'               => 'nullable|date',
            'tahun_pensiun'             => 'nullable|integer',
            'batas_usia_pensiun'        => 'nullable|integer',
        ]);

        // === UPSERT LOGIC berdasarkan NIP ===
        $existing = Tendik::withTrashed()->where('nip_baru', $validated['nip_baru'])->first();

        if ($existing) {
            // Restore jika sedang soft-deleted
            if ($existing->trashed()) {
                $existing->restore();
            }
            $validated['updated_by'] = $request->user()->id;
            $existing->update($validated);
            
            // Clear dashboard cache
            Cache::forget('dashboard_metrics');
            
            ActivityLogger::log('UPDATE', "Memperbarui (upsert) data tendik: {$existing->nama_lengkap}", $request);
            return response()->json(['message' => 'Data tendik diperbarui (sudah ada).', 'data' => $existing->fresh()->load('department'), 'action' => 'updated'], 200);
        }

        // Data belum ada → Insert baru
        $validated['created_by'] = $request->user()->id;
        $tendik = Tendik::create($validated);
        
        // Clear dashboard cache
        Cache::forget('dashboard_metrics');
        
        ActivityLogger::log('CREATE', "Menambahkan data tendik: {$tendik->nama_lengkap}", $request);
        return response()->json(['message' => 'Data tendik baru berhasil ditambahkan.', 'data' => $tendik->load('department'), 'action' => 'created'], 201);
    }

    public function show(Tendik $tendik)
    {
        return response()->json($tendik->load(['department', 'user', 'diklat', 'createdBy', 'updatedBy']));
    }

    public function update(Request $request, Tendik $tendik)
    {
        $validated = $request->validate([
            'nama_lengkap'              => 'sometimes|string|max:150',
            'jenis_kelamin'             => 'sometimes|in:L,P',
            'tempat_lahir'              => 'sometimes|string|max:100',
            'tanggal_lahir'             => 'sometimes|date',
            'nip_baru'                  => 'sometimes|string|max:50',
            'department_id'             => 'nullable|exists:departments,id',
            'golongan_cpns'             => 'nullable|string|max:20',
            'tmt_cpns'                  => 'nullable|date',
            'golongan_pangkat'          => 'nullable|string|max:20',
            'tmt_pangkat'               => 'nullable|date',
            'nama_jabatan'              => 'nullable|string|max:100',
            'tmt_jabatan'               => 'nullable|date',
            'tanggal_mulai_tugas_unit'  => 'nullable|date',
            'tanggal_mulai_keseluruhan' => 'nullable|date',
            'tanggal_mulai_golongan'    => 'nullable|date',
            'nama_pendidikan'           => 'nullable|string|max:100',
            'tahun_lulus'               => 'nullable|integer',
            'tingkat_ijazah'            => 'nullable|string|max:50',
            'tmt_pensiun'               => 'nullable|date',
            'tahun_pensiun'             => 'nullable|integer',
            'batas_usia_pensiun'        => 'nullable|integer',
        ]);

        $validated['updated_by'] = $request->user()->id;
        $tendik->update($validated);
        
        // Clear dashboard cache
        Cache::forget('dashboard_metrics');
        
        ActivityLogger::log('UPDATE', "Memperbarui data tendik: {$tendik->nama_lengkap}", $request);
        return response()->json($tendik->fresh()->load('department'));
    }

    public function destroy(Request $request, Tendik $tendik)
    {
        $nama = $tendik->nama_lengkap;
        $tendik->delete();
        
        // Clear dashboard cache
        Cache::forget('dashboard_metrics');
        
        ActivityLogger::log('DELETE', "Menghapus data tendik: {$nama}", $request);
        return response()->json(['message' => 'Data TENDIK berhasil dihapus soft-delete'], 200);
    }

    public function export()
    {
        return Excel::download(new TendikExport, 'data-tendik-fkunand.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            Excel::import(new TendikImport, $request->file('file'));
            
            // Clear dashboard cache
            Cache::forget('dashboard_metrics');
            
            return response()->json(['message' => 'Data Tendik berhasil diimpor!'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengimpor data: ' . $e->getMessage()], 500);
        }
    }
}
