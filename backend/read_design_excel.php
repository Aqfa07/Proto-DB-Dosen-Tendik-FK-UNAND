<?php
require __DIR__ . '/vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

$filePath = 'D:/laragon/www/Database Dosen dan Tendik/rancangan_kolom_database_dosen.xlsx';
try {
    $spreadsheet = IOFactory::load($filePath);
    $sheet = $spreadsheet->getActiveSheet();
    $data = $sheet->toArray();
    
    echo "--- Content of rancangan_kolom_database_dosen.xls ---\n";
    foreach ($data as $rowIndex => $row) {
        if ($rowIndex > 20) break; // Only first 20 rows
        echo "Row " . ($rowIndex + 1) . ": " . implode(" | ", array_filter($row)) . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
