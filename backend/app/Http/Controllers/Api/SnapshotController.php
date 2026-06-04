<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\QuarterlySnapshot;
use App\Models\SnapshotDosen;
use App\Models\SnapshotTendik;
use App\Models\Dosen;
use App\Models\Tendik;

class SnapshotController extends Controller
{
    public function finalizeQuarter(Request $request)
    {
        $request->validate([
            'quarter' => 'required|in:Q1,Q2,Q3,Q4',
            'year' => 'required|integer|min:2020',
        ]);

        $snapshotId = DB::transaction(function () use ($request) {
            $snapshot = QuarterlySnapshot::create([
                'quarter_label' => $request->quarter . ' ' . $request->year,
                'status' => 'FINAL',
                'created_by' => $request->user()->id,
            ]);

            Dosen::with('department')->chunk(100, function ($dosens) use ($snapshot) {
                $batch = [];
                foreach ($dosens as $dosen) {
                    $batch[] = [
                        'snapshot_id' => $snapshot->id,
                        'dosen_id' => $dosen->id,
                        'data_snapshot' => collect($dosen->toArray())->toJson(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                SnapshotDosen::insert($batch);
            });

            Tendik::with('department')->chunk(100, function ($tendiks) use ($snapshot) {
                $batch = [];
                foreach ($tendiks as $tendik) {
                    $batch[] = [
                        'snapshot_id' => $snapshot->id,
                        'tendik_id' => $tendik->id,
                        'data_snapshot' => collect($tendik->toArray())->toJson(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                SnapshotTendik::insert($batch);
            });

            return $snapshot->id;
        });

        return response()->json([
            'message' => "Snapshot Triwulan {$request->quarter} Tahun {$request->year} berhasil diarsipkan secara permanen.",
            'snapshot_id' => $snapshotId
        ], 201);
    }

    public function index()
    {
        $history = QuarterlySnapshot::with('createdBy:id,email')->orderBy('id', 'desc')->get()->map(function($snap) {
            $parts = explode(' ', $snap->quarter_label);
            return [
                'id' => $snap->id,
                'quarter' => $parts[0] ?? $snap->quarter_label,
                'year' => isset($parts[1]) ? (int)$parts[1] : null,
                'snapshot_date' => $snap->created_at,
                'created_by' => $snap->createdBy
            ];
        });
        return response()->json($history);
    }

    public function show($id)
    {
        $snapshot = QuarterlySnapshot::findOrFail($id);
        $dosens = SnapshotDosen::where('snapshot_id', $id)->get()->map(fn($item) => json_decode($item->data_snapshot));
        $tendiks = SnapshotTendik::where('snapshot_id', $id)->get()->map(fn($item) => json_decode($item->data_snapshot));

        return response()->json([
            'snapshot_info' => $snapshot,
            'dosen_data' => $dosens,
            'tendik_data' => $tendiks,
        ]);
    }

    public function dosenHistory($id)
    {
        $snapshot = QuarterlySnapshot::findOrFail($id);
        $dosens = SnapshotDosen::where('snapshot_id', $id)->get()->map(fn($item) => json_decode($item->data_snapshot));

        return response()->json([
            'snapshot_info' => $snapshot,
            'dosen_data' => $dosens,
        ]);
    }
}
