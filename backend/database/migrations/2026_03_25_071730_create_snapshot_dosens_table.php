<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('snapshot_dosens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('snapshot_id')->constrained('quarterly_snapshots')->cascadeOnDelete();
            $table->uuid('dosen_id');
            $table->jsonb('data_snapshot');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('snapshot_dosens');
    }
};
