<?php

namespace App\Imports;

use App\Models\Dosen;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Facades\Log;

class DosenImport implements ToCollection, WithStartRow, WithChunkReading
{
    private string $kategoriDosen;

    public function __construct(string $kategoriDosen = 'Dosen NIDN')
    {
        $this->kategoriDosen = $kategoriDosen;
    }

    public function startRow(): int
    {
        return 1;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 8;
            $nama = trim($row[1] ?? ''); // B
            
            if (empty($nama) || is_numeric($nama) || in_array(strtoupper($nama), ['TOTAL', 'SUBTOTAL', 'NAMA'])) {
                continue;
            }

            try {
                $data = [
                    'nama_lengkap'   => $nama,
                    'jenis_kelamin'  => strtoupper(trim($row[2] ?? 'L')) === 'P' ? 'P' : 'L', // C
                    'kategori_dosen' => $this->kategoriDosen,
                ];

                if ($this->kategoriDosen === 'Dosen NIDK') {
                    // --- MAPPING NIDK (Dosen Luar Biasa) ---
                    // D = Tempat, Tanggal Lahir (Combined)
                    $rawTTL = trim($row[3] ?? '');
                    if (!empty($rawTTL)) {
                        if (str_contains($rawTTL, ',')) {
                            $parts = explode(',', $rawTTL);
                            $data['tempat_lahir'] = trim($parts[0]);
                            $data['tanggal_lahir'] = $this->parseFlexibleDate(trim($parts[1] ?? ''));
                        } else {
                            $data['tempat_lahir'] = $rawTTL;
                        }
                    }

                    // E = Pangkat/Golongan (Combined)
                    $rawPangkatGol = trim($row[4] ?? '');
                    if (!empty($rawPangkatGol)) {
                        // Split by comma or slash
                        $parts = preg_split('/[,\/]/', $rawPangkatGol);
                        $data['pangkat'] = trim($parts[0]);
                        if (isset($parts[1])) {
                            $data['golongan'] = trim($parts[1]);
                        }
                    }

                    $data['masa_kerja_keseluruhan'] = $this->cleanString($row[5] ?? null); // F
                    $data['departemen_bagian'] = $this->cleanString($row[6] ?? null);      // G
                    $data['bidang_keahlian'] = $this->cleanString($row[7] ?? null);        // H
                    $data['pendidikan_terakhir'] = $this->cleanString($row[8] ?? null);    // I
                    $data['tmt_cpns'] = $this->parseFlexibleDate($row[9] ?? null);         // J
                    $data['unit_kerja'] = $this->cleanString($row[10] ?? null);           // K

                } else {
                    // --- MAPPING NIDN (Dosen Tetap/Tidak Tetap/PPPK) ---
                    $data['nip']   = $this->cleanString($row[3] ?? null); // D
                    $data['nuptk'] = $this->cleanString($row[4] ?? null); // E
                    $data['nidn']  = $this->cleanString($row[5] ?? null); // F

                    $data['tempat_lahir'] = trim($row[6] ?? 'Tidak Diketahui'); // G
                    $data['tanggal_lahir'] = $this->parseFlexibleDate($row[7] ?? null); // H

                    $data['tmt_cpns'] = $this->parseFlexibleDate($row[8] ?? null); // I
                    $data['pangkat'] = $this->cleanString($row[9] ?? null); // J
                    $data['golongan'] = $this->cleanString($row[10] ?? null); // K
                    $data['tmt_pangkat'] = $this->parseFlexibleDate($row[11] ?? null); // L
                    $data['masa_kerja_pangkat'] = $this->cleanString($row[12] ?? null); // M
                    $data['jabatan_fungsional'] = $this->cleanString($row[13] ?? null); // N
                    $data['tmt_fungsional'] = $this->parseFlexibleDate($row[14] ?? null); // O
                    $data['masa_kerja_fungsional'] = $this->cleanString($row[15] ?? null); // P
                    $data['masa_kerja_keseluruhan'] = $this->cleanString($row[16] ?? null); // Q
                    
                    $data['departemen_bagian'] = $this->cleanString($row[17] ?? null); // R
                    $data['bidang_keahlian'] = $this->cleanString($row[18] ?? null);   // S
                    $data['home_base'] = $this->cleanString($row[19] ?? null);         // T
                    $data['pendidikan_terakhir'] = $this->cleanString($row[24] ?? null); // Y (Ijazah)

                    $rawTahunLulus = $row[21] ?? null; // V
                    if (is_numeric($rawTahunLulus) && (int)$rawTahunLulus > 1900) {
                        $data['tahun_lulus'] = (int)$rawTahunLulus;
                    }
                    
                    $rawTingkat = strtoupper(trim($row[20] ?? '')); // U
                    $data['tingkat_pendidik'] = $this->mapTingkatPendidik($rawTingkat);

                    $data['unit_kerja'] = $this->cleanString($row[25] ?? null); // Z
                }

                // Fallback Tanggal Lahir jika null (Wajib di struktur table)
                if (empty($data['tanggal_lahir'])) {
                    $data['tanggal_lahir'] = '1970-01-01';
                }

                Dosen::create($data);

            } catch (\Exception $e) {
                Log::error("Error importing row {$rowNumber} ({$this->kategoriDosen}): " . $e->getMessage());
            }
        }
    }

    private function parseFlexibleDate($value): ?string
    {
        if (empty($value)) return null;

        // Excel Serial Number
        if (is_numeric($value) && (float)$value > 1000) {
            try {
                return Date::excelToDateTimeObject((float)$value)->format('Y-m-d');
            } catch (\Exception $e) {
                return null;
            }
        }

        $value = trim((string)$value);
        if (empty($value) || in_array($value, ['-', '?', '.'])) return null;

        // Case: "9 Maret 1965" or other string dates
        $months = [
            'Januari' => '01', 'Februari' => '02', 'Maret' => '03', 'April' => '04',
            'Mei' => '05', 'Juni' => '06', 'Juli' => '07', 'Agustus' => '08',
            'September' => '09', 'Oktober' => '10', 'November' => '11', 'Desember' => '12',
            // Variasi lain
            'jan' => '01', 'feb' => '02', 'mar' => '03', 'apr' => '04', 'mei' => '05', 'jun' => '06',
            'jul' => '07', 'agu' => '08', 'sep' => '09', 'okt' => '10', 'nov' => '11', 'des' => '12'
        ];

        // Regex untuk "9 Maret 1965"
        if (preg_match('/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/', $value, $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $monthInput = strtolower($matches[2]);
            $year = $matches[3];

            foreach ($months as $name => $num) {
                if (str_starts_with($monthInput, strtolower($name))) {
                    return "{$year}-{$num}-{$day}";
                }
            }
        }

        // Standard Formats
        $value = str_replace(['/', '.'], '-', $value);
        $formats = ['d-m-Y', 'Y-m-d', 'd-m-y', 'j-n-Y', 'm-d-Y'];
        
        foreach ($formats as $fmt) {
            $dt = \DateTime::createFromFormat($fmt, $value);
            if ($dt !== false) {
                $year = (int)$dt->format('Y');
                if ($year >= 1900 && $year <= 2100) return $dt->format('Y-m-d');
            }
        }

        return null;
    }

    private function mapTingkatPendidik(string $tingkat): int
    {
        if (str_contains($tingkat, 'S3')) return 3;
        if (str_contains($tingkat, 'S2')) return 2;
        if (str_contains($tingkat, 'S1')) return 1;
        return 0;
    }

    private function cleanString($value): ?string
    {
        if ($value === null) return null;
        $v = trim((string)$value);
        return in_array($v, ['', '-', '?', '.']) ? null : $v;
    }

    public function chunkSize(): int
    {
        return 100;
    }
}
