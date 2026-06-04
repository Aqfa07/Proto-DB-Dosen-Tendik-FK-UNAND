<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KpiDekan;
use App\Models\QuarterlySnapshot;
use App\Models\SnapshotDosen;
use App\Models\SnapshotTendik;
use App\Models\Dosen;
use App\Models\Tendik;
use App\Models\User;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run()
    {
        // 1. Kinerja Dekan Dummy Data
        // Bersihkan dulu data yang ada agar tidak dobel
        KpiDekan::truncate();

        $kpiData = [
            [
                'tahun' => 2026,
                'indikator' => 'Jumlah Dosen Kualifikasi S3 (Doktor)',
                'target' => 80,
                'realisasi_q1' => 20,
                'realisasi_q2' => 15,
                'realisasi_q3' => 18,
                'realisasi_q4' => 25,
            ],
            [
                'tahun' => 2026,
                'indikator' => 'Persentase Dosen Memiliki Sertifikasi Pendidik',
                'target' => 90,
                'realisasi_q1' => 20,
                'realisasi_q2' => 30,
                'realisasi_q3' => 20,
                'realisasi_q4' => 15,
            ],
            [
                'tahun' => 2026,
                'indikator' => 'Jumlah Publikasi Jurnal Internasional Bereputasi',
                'target' => 120,
                'realisasi_q1' => 25,
                'realisasi_q2' => 40,
                'realisasi_q3' => 35,
                'realisasi_q4' => 30,
            ],
            [
                'tahun' => 2026,
                'indikator' => 'Jumlah HKI (Hak Kekayaan Intelektual) Dosen',
                'target' => 15,
                'realisasi_q1' => 2,
                'realisasi_q2' => 5,
                'realisasi_q3' => 4,
                'realisasi_q4' => 6,
            ],
            [
                'tahun' => 2026,
                'indikator' => 'Kerjasama Riset Institusi Internasional',
                'target' => 5,
                'realisasi_q1' => 1,
                'realisasi_q2' => 1,
                'realisasi_q3' => 2,
                'realisasi_q4' => 2,
            ]
        ];

        foreach ($kpiData as $data) {
            KpiDekan::create($data);
        }

        // 2. Arsip Triwulan Dummy Data
        // Bersihkan dulu yang ada (opsional, tapi baik untuk testing)
        SnapshotDosen::truncate();
        SnapshotTendik::truncate();
        QuarterlySnapshot::truncate();

        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Admin Dummy',
                'email' => 'admin.dummy@fkunand.ac.id',
                'password' => bcrypt('password'),
            ]);
        }

        $quarters = ['Q1', 'Q2', 'Q3'];
        $year = 2025; // Kita buat tahun lalu agar terlihat seperti history

        foreach ($quarters as $q) {
            $snapshot = QuarterlySnapshot::create([
                'quarter_label' => $q . ' ' . $year,
                'status' => 'FINAL',
                'created_by' => $user->id,
            ]);

            // Dosen Snapshot
            Dosen::chunk(50, function ($dosens) use ($snapshot) {
                $batch = [];
                foreach ($dosens as $dosen) {
                    $arr = $dosen->toArray();
                    // Simulasikan data yang sedikit berkurang di masa lalu
                    if (rand(0, 100) > 90) continue; 
                    
                    $batch[] = [
                        'id' => Str::uuid()->toString(),
                        'snapshot_id' => $snapshot->id,
                        'dosen_id' => $dosen->id,
                        'data_snapshot' => collect($arr)->toJson(),
                        'created_at' => now()->subMonths(rand(1, 10)),
                        'updated_at' => now(),
                    ];
                }
                if (!empty($batch)) {
                    SnapshotDosen::insert($batch);
                }
            });

            // Tendik Snapshot
            Tendik::chunk(50, function ($tendiks) use ($snapshot) {
                $batch = [];
                foreach ($tendiks as $tendik) {
                    $arr = $tendik->toArray();
                    if (rand(0, 100) > 90) continue; 
                    
                    $batch[] = [
                        'id' => Str::uuid()->toString(),
                        'snapshot_id' => $snapshot->id,
                        'tendik_id' => $tendik->id,
                        'data_snapshot' => collect($arr)->toJson(),
                        'created_at' => now()->subMonths(rand(1, 10)),
                        'updated_at' => now(),
                    ];
                }
                if (!empty($batch)) {
                    SnapshotTendik::insert($batch);
                }
            });
        }
    }
}
