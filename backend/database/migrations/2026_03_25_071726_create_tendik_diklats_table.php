<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tendik_diklats', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tendik_id')->constrained('tendiks')->cascadeOnDelete();
            $table->string('nama_latihan', 255);
            $table->integer('bulan_pelaksanaan');
            $table->integer('tahun_pelaksanaan');
            $table->integer('jumlah_jam');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tendik_diklats');
    }
};
