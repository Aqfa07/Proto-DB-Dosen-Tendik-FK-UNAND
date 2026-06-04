<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dosens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            
            // A. Identitas
            $table->enum('status_dosen', ['NIDN', 'NIDK', 'PPPK', 'TIDAK_TETAP'])->index();
            $table->string('nama_lengkap', 150);
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir', 100);
            $table->date('tanggal_lahir');
            
            // B. Identitas Pegawai
            $table->string('nip', 50)->nullable();
            $table->string('nuptk', 50)->nullable();
            $table->string('nomor_induk_dosen', 50)->nullable();
            $table->date('tmt_nidk_terbit')->nullable();
            
            // C. Kepangkatan dan Jabatan
            $table->string('pangkat', 50)->nullable();
            $table->string('golongan', 20)->nullable();
            $table->string('jabatan_fungsional', 100)->nullable();
            $table->date('tmt_cpns')->nullable();
            $table->date('tmt_pangkat')->nullable();
            $table->date('tmt_fungsional')->nullable();
            
            // D. Penempatan dan Akademik
            $table->string('unit_kerja', 100)->nullable();
            $table->string('homebase_bidang_utama', 150)->nullable();
            $table->string('bidang_keahlian_spesifik', 150)->nullable();
            
            // E. Pendidikan
            $table->string('tingkat_pendidik', 50)->nullable();
            $table->integer('tahun_lulus')->nullable();
            $table->string('tingkat_ijazah', 50)->nullable();
            
            // F. Masa Kerja
            $table->date('tanggal_mulai_keseluruhan')->nullable();
            $table->date('tmt_pensiun')->nullable();
            
            // Audit & Soft Delete
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dosens');
    }
};
