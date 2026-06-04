<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class GenerateTemplates extends Command
{
    protected $signature = 'templates:generate';
    protected $description = 'Generate Excel templates for Dosen and Tendik import';

    public function handle()
    {
        $this->generateNIDNTemplate();
        $this->generateNIDKTemplate();
        $this->generateTendikTemplate();
        $this->info('Templates generated successfully in public/templates');
    }

    private function generateNIDNTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Data starts at row 8 according to DosenImport
        $headers = [
            'No', 'Nama Lengkap', 'L/P', 'NIP', 'NUPTK', 'NIDN', 'Tempat Lahir', 'Tanggal Lahir',
            'TMT CPNS', 'Pangkat', 'Golongan', 'TMT Pangkat', 'MK Pangkat', 'Jabatan Fungsional',
            'TMT Fungsional', 'MK Fungsional', 'MK Keseluruhan', 'Departemen / Bagian', 'Bidang Keahlian',
            'Home Base', 'Tingkat Pendidik', 'Tahun Lulus', '-', '-', 'Pendidikan Terakhir (Ijazah)', 'Unit Kerja'
        ];

        foreach ($headers as $index => $header) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
            $sheet->setCellValue($col . '7', $header);
            $sheet->getStyle($col . '7')->getFont()->setBold(true);
        }

        $colB = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(2);
        $sheet->setCellValue($colB . '8', 'Prof. Budi');
        $colC = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(3);
        $sheet->setCellValue($colC . '8', 'L');

        $writer = new Xlsx($spreadsheet);
        $path = public_path('templates/Template_Import_NIDN.xlsx');
        if (!file_exists(public_path('templates'))) {
            mkdir(public_path('templates'), 0777, true);
        }
        $writer->save($path);
    }

    private function generateNIDKTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = [
            'No', 'Nama Lengkap', 'L/P', 'Tempat Lahir, Tgl Lahir', 'Pangkat / Golongan',
            'Masa Kerja Keseluruhan', 'Departemen/Bagian', 'Bidang Keahlian',
            'Pendidikan Terakhir', 'TMT TKT Dosen Luar Biasa', 'Unit Kerja'
        ];

        foreach ($headers as $index => $header) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
            $sheet->setCellValue($col . '7', $header);
            $sheet->getStyle($col . '7')->getFont()->setBold(true);
        }

        $colB = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(2);
        $sheet->setCellValue($colB . '8', 'Dr. Siti');
        $colC = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(3);
        $sheet->setCellValue($colC . '8', 'P');

        $writer = new Xlsx($spreadsheet);
        $path = public_path('templates/Template_Import_NIDK.xlsx');
        $writer->save($path);
    }

    private function generateTendikTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // 1 baris header polos sesuai kesepakatan
        $headers = [
            'No', 'Nama Lengkap', 'L/P', 'NIP Baru', 'Tempat Lahir', 'Tanggal Lahir',
            'TMT Pensiun', 'Tahun Pensiun', 
            'Golongan CPNS', 'TMT CPNS', 'Masa Kerja SK CPNS',
            'Golongan Pangkat', 'TMT Pangkat', 'Masa Kerja SK Pangkat', 
            'Nama Jabatan', 'TMT Jabatan', 
            'Masa Tugas di Unit Tahun', 'Masa Tugas di Unit Bulan',
            'Masa Kerja Keseluruhan Tahun', 'Masa Kerja Keseluruhan Bulan',
            'Masa Kerja Golongan Tahun', 'Masa Kerja Golongan Bulan',
            'Nama Pendidikan', 'Tahun Lulus', 'Tingkat Ijazah'
        ];

        foreach ($headers as $index => $header) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
            $sheet->setCellValue($col . '1', $header);
            $sheet->getStyle($col . '1')->getFont()->setBold(true);
        }

        // Contoh Data
        $colB = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(2);
        $sheet->setCellValue($colB . '2', 'Budi Santoso');
        $colC = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(3);
        $sheet->setCellValue($colC . '2', 'L');
        $colD = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(4);
        $sheet->setCellValue($colD . '2', '198001012005011001');

        $writer = new Xlsx($spreadsheet);
        $path = public_path('templates/Template_Import_Tendik.xlsx');
        if (!file_exists(public_path('templates'))) {
            mkdir(public_path('templates'), 0777, true);
        }
        $writer->save($path);
    }
}
