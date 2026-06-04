<?php

namespace App\Imports;

use App\Models\Tendik;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class TendikImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    public function collection(Collection $rows)
    {
        $parseDate = function($value) {
            if (empty($value)) return null;
            try {
                if (is_numeric($value)) {
                    return Date::excelToDateTimeObject($value)->format('Y-m-d');
                }
                return date('Y-m-d', strtotime($value));
            } catch (\Exception $e) {
                return null;
            }
        };

        foreach ($rows as $index => $row) {
            if (!isset($row['nama_lengkap']) || empty($row['nama_lengkap'])) {
                continue;
            }

            try {
                $tanggalLahir = $parseDate($row['tanggal_lahir'] ?? null);
                $tmtCpns = $parseDate($row['tmt_cpns'] ?? null);
                $tmtPangkat = $parseDate($row['tmt_pangkat'] ?? null);
                $tmtJabatan = $parseDate($row['tmt_jabatan'] ?? null);
                $tmtPensiun = $parseDate($row['tmt_pensiun'] ?? null);

                $tglMulaiTugas = $tmtJabatan; 
                $tglMulaiKeseluruhan = $tmtCpns;
                $tglMulaiGolongan = $tmtPangkat;

                Tendik::create([
                    'nama_lengkap' => $row['nama_lengkap'],
                    'jenis_kelamin' => isset($row['l_p']) ? strtoupper($row['l_p']) : (isset($row['jenis_kelamin']) ? strtoupper($row['jenis_kelamin']) : 'L'),
                    'tempat_lahir' => $row['tempat_lahir'] ?? null,
                    'tanggal_lahir' => $tanggalLahir,
                    'nip_baru' => $row['nip_baru'] ?? null,
                    
                    'golongan_cpns' => $row['golongan_cpns'] ?? null,
                    'tmt_cpns' => $tmtCpns,
                    'golongan_pangkat' => $row['golongan_pangkat'] ?? null,
                    'tmt_pangkat' => $tmtPangkat,
                    'nama_jabatan' => $row['nama_jabatan'] ?? null,
                    'tmt_jabatan' => $tmtJabatan,
                    
                    'tanggal_mulai_tugas_unit' => $tglMulaiTugas,
                    'tanggal_mulai_keseluruhan' => $tglMulaiKeseluruhan,
                    'tanggal_mulai_golongan' => $tglMulaiGolongan,
                    
                    'nama_pendidikan' => $row['nama_pendidikan'] ?? null,
                    'tahun_lulus' => isset($row['tahun_lulus']) ? (int) $row['tahun_lulus'] : (isset($row['pendidikan_lulus_thn_ijazah']) ? (int) $row['pendidikan_lulus_thn_ijazah'] : null),
                    'tingkat_ijazah' => $row['tingkat_ijazah'] ?? null,
                    
                    'tmt_pensiun' => $tmtPensiun,
                    'tahun_pensiun' => isset($row['tahun_pensiun']) ? (int) $row['tahun_pensiun'] : null,
                ]);

            } catch (\Exception $e) {
                $errName = $row['nama_lengkap'] ?? 'Unknown';
                Log::error("Error importing tendik {$errName}: " . $e->getMessage());
            }
        }
    }

    public function chunkSize(): int
    {
        return 100;
    }
}
