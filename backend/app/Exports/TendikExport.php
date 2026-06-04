<?php

namespace App\Exports;

use App\Models\Tendik;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TendikExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    private int $rowNumber = 0;

    public function collection()
    {
        return Tendik::with('department')->orderBy('nama_lengkap')->get();
    }

    public function headings(): array
    {
        return [
            'No', 'Nama Lengkap', 'L/P', 'NIP Baru', 'Tempat Lahir', 'Tanggal Lahir',
            'TMT Pensiun', 'Tahun Pensiun', 
            'Golongan CPNS', 'TMT CPNS', 'Masa Kerja SK CPNS',
            'Golongan Pangkat', 'TMT Pangkat', 'Masa Kerja SK Pangkat', 
            'Nama Jabatan', 'TMT Jabatan', 
            'Masa Tugas di Unit Tahun', 'Masa Tugas di Unit Bulan',
            'Masa Kerja Keseluruhan Tahun', 'Masa Kerja Keseluruhan Bulan',
            'Masa Kerja Golongan Tahun', 'Masa Kerja Golongan Bulan',
            'Nama Pendidikan', 'Tahun Lulus', 'Tingkat Ijazah',
            'Departemen'
        ];
    }

    public function map($tendik): array
    {
        ++$this->rowNumber;
        
        return [
            $this->rowNumber,
            $tendik->nama_lengkap,
            $tendik->jenis_kelamin,
            $tendik->nip_baru,
            $tendik->tempat_lahir,
            $tendik->tanggal_lahir ? clone $tendik->tanggal_lahir : null,
            $tendik->tmt_pensiun ? clone $tendik->tmt_pensiun : null,
            $tendik->tahun_pensiun,
            $tendik->golongan_cpns,
            $tendik->tmt_cpns ? clone $tendik->tmt_cpns : null,
            '', // Masa Kerja SK CPNS (not in DB)
            $tendik->golongan_pangkat,
            $tendik->tmt_pangkat ? clone $tendik->tmt_pangkat : null,
            '', // Masa Kerja SK Pangkat
            $tendik->nama_jabatan,
            $tendik->tmt_jabatan ? clone $tendik->tmt_jabatan : null,
            $tendik->tanggal_mulai_tugas_unit ? clone $tendik->tanggal_mulai_tugas_unit : null, // Mapped back minimally
            '',
            $tendik->tanggal_mulai_keseluruhan ? clone $tendik->tanggal_mulai_keseluruhan : null,
            '',
            $tendik->tanggal_mulai_golongan ? clone $tendik->tanggal_mulai_golongan : null,
            '',
            $tendik->nama_pendidikan,
            $tendik->tahun_lulus,
            $tendik->tingkat_ijazah,
            $tendik->department ? $tendik->department->name : '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
