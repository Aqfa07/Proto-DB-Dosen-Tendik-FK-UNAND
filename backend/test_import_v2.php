<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Imports\DosenImport;
use App\Models\Dosen;
use Maatwebsite\Excel\Facades\Excel;

echo "--- Testing Refactored Dosen Import (NIDN & NIDK) ---\n";

// Clear existing data for clean test
Dosen::truncate();
echo "Database cleared.\n\n";

// 1. Test NIDN Import
echo "Importing NIDN ok.xlsx...\n";
try {
    Excel::import(new DosenImport('Dosen NIDN'), 'D:/laragon/www/Database Dosen dan Tendik/NIDN ok.xlsx');
    echo "SUCCESS: NIDN Import completed.\n";
} catch (\Exception $e) {
    echo "FAILED NIDN: " . $e->getMessage() . "\n";
}

echo "\n";

// 2. Test NIDK Import
echo "Importing NIDK ok.xlsx...\n";
try {
    Excel::import(new DosenImport('Dosen NIDK'), 'D:/laragon/www/Database Dosen dan Tendik/NIDK ok.xlsx');
    echo "SUCCESS: NIDK Import completed.\n";
} catch (\Exception $e) {
    echo "FAILED NIDK: " . $e->getMessage() . "\n";
}

echo "\n--- Database Verification ---\n";
$total = Dosen::count();
$nidnCount = Dosen::where('kategori_dosen', 'Dosen NIDN')->count();
$nidkCount = Dosen::where('kategori_dosen', 'Dosen NIDK')->count();

echo "Total Dosen: $total\n";
echo "Dosen NIDN: $nidnCount\n";
echo "Dosen NIDK: $nidkCount\n";

echo "\nSample NIDN (First 2):\n";
$nidnSamples = Dosen::where('kategori_dosen', 'Dosen NIDN')->limit(2)->get();
foreach ($nidnSamples as $s) {
    echo "- Name: {$s->nama_lengkap} | NIDN: {$s->nidn} | Rank: {$s->pangkat} | DOB: {$s->tanggal_lahir->format('Y-m-d')}\n";
}

echo "\nSample NIDK (First 2):\n";
$nidkSamples = Dosen::where('kategori_dosen', 'Dosen NIDK')->limit(2)->get();
foreach ($nidkSamples as $s) {
    echo "- Name: {$s->nama_lengkap} | NIDK: {$s->nidk} | Rank: {$s->pangkat} | DOB: {$s->tanggal_lahir->format('Y-m-d')}\n";
}
