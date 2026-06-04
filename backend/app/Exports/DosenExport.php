<?php

namespace App\Exports;

use App\Models\Dosen;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DosenExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    private int $rowNumber = 0;

    public function collection()
    {
        // Export only dosens; sort by nama_lengkap
        return Dosen::orderBy('nama_lengkap')->get();
    }

    public function headings(): array
    {
        return [
            'No', // A
            'Nama Lengkap', // B
            'L/P', // C
            'NIP', // D
            'NUPTK', // E
            'NIDN', // F
            'Tempat Lahir', // G
            'Tanggal Lahir', // H
            'TMT CPNS', // I
            'Pangkat', // J
            'Golongan', // K
            'TMT Pangkat', // L
            'MK Pangkat', // M
            'Jabatan Fungsional', // N
            'TMT Fungsional', // O
            'MK Fungsional', // P
            'MK Keseluruhan', // Q
            'Departemen/Bagian', // R
            'Bidang Keahlian', // S
            'Home Base', // T
            'Tingkat Pendidik', // U
            'Tahun Lulus', // V
            'Kategori Dosen', // W (Custom added just to preserve data)
            'NIDK', // X (Custom added just to preserve data)
            'Pendidikan Terakhir (Ijazah)', // Y
            'Unit Kerja', // Z
        ];
    }

    public function map($dosen): array
    {
        // Helper untuk Tingkat Pendidik
        $tingkat = '';
        if ($dosen->tingkat_pendidik === 3) $tingkat = 'S3';
        elseif ($dosen->tingkat_pendidik === 2) $tingkat = 'S2';
        elseif ($dosen->tingkat_pendidik === 1) $tingkat = 'S1';

        ++$this->rowNumber;

        return [
            $this->rowNumber, // A
            $dosen->nama_lengkap, // B
            $dosen->jenis_kelamin, // C
            $dosen->nip, // D
            $dosen->nuptk, // E
            $dosen->nidn, // F
            $dosen->tempat_lahir, // G
            $dosen->tanggal_lahir ? $dosen->tanggal_lahir : '', // H
            $dosen->tmt_cpns ? $dosen->tmt_cpns : '', // I
            $dosen->pangkat, // J
            $dosen->golongan, // K
            $dosen->tmt_pangkat ? $dosen->tmt_pangkat : '', // L
            $dosen->masa_kerja_pangkat, // M
            $dosen->jabatan_fungsional, // N
            $dosen->tmt_fungsional ? $dosen->tmt_fungsional : '', // O
            $dosen->masa_kerja_fungsional, // P
            $dosen->masa_kerja_keseluruhan, // Q
            $dosen->departemen_bagian, // R
            $dosen->bidang_keahlian, // S
            $dosen->home_base, // T
            $tingkat, // U
            $dosen->tahun_lulus, // V
            $dosen->kategori_dosen, // W
            $dosen->nidk, // X
            $dosen->pendidikan_terakhir, // Y
            $dosen->unit_kerja, // Z
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }
}
