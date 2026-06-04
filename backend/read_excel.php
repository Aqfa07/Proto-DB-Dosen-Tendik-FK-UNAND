<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check existing departments
echo "=== Departments ===\n";
$depts = \App\Models\Department::all(['id','name']);
foreach ($depts as $d) {
    echo "  ID {$d->id}: {$d->name}\n";
}

echo "\n=== Users ===\n";
$users = \App\Models\User::all(['id','email','role_id']);
foreach ($users as $u) {
    echo "  {$u->id}: {$u->email} (role={$u->role_id})\n";
}

echo "\n=== Dosen count ===\n";
echo \App\Models\Dosen::count() . "\n";
