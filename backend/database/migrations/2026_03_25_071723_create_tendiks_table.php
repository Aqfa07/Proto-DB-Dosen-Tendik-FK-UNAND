<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tendiks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            
            $table->string('nama_lengkap', 150);
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir', 100);
            $table->date('tanggal_lahir');
            $table->string('nip_baru', 50);
            
            $table->string('golongan_cpns', 20)->nullable();
            $table->date('tmt_cpns')->nullable();
            $table->string('golongan_pangkat', 20)->nullable();
            $table->date('tmt_pangkat')->nullable();
            $table->string('nama_jabatan', 100)->nullable();
            $table->date('tmt_jabatan')->nullable();
            
            $table->date('tanggal_mulai_tugas_unit')->nullable();
            $table->date('tanggal_mulai_keseluruhan')->nullable();
            $table->date('tanggal_mulai_golongan')->nullable();
            
            $table->string('nama_pendidikan', 100)->nullable();
            $table->integer('tahun_lulus')->nullable();
            $table->string('tingkat_ijazah', 50)->nullable();
            
            $table->date('tmt_pensiun')->nullable();
            $table->integer('tahun_pensiun')->nullable();
            $table->integer('batas_usia_pensiun')->nullable();
            
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tendiks');
    }
};
