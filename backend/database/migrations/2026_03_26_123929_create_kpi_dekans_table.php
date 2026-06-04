<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kpi_dekans', function (Blueprint $table) {
            $table->id();
            $table->integer('tahun');
            $table->string('indikator', 500);
            $table->decimal('target', 10, 2)->default(0);
            $table->decimal('realisasi_q1', 10, 2)->default(0);
            $table->decimal('realisasi_q2', 10, 2)->default(0);
            $table->decimal('realisasi_q3', 10, 2)->default(0);
            $table->decimal('realisasi_q4', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpi_dekans');
    }
};
