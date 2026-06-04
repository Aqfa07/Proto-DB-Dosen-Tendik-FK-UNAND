<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Dosen;
use Illuminate\Support\Str;

echo "--- Testing Dosen UUID generation ---\n";
try {
    $d = new Dosen();
    $d->nama_lengkap = 'Test UUID ' . Str::random(5);
    $d->status_dosen = 'NIDN';
    $d->jenis_kelamin = 'L';
    $d->tempat_lahir = 'Padang';
    $d->tanggal_lahir = '1990-01-01';
    $d->save();
    
    echo "SUCCESS! Created Dosen with ID: " . $d->id . "\n";
    $d->delete();
    echo "Deleted temporary test record.\n";
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}
