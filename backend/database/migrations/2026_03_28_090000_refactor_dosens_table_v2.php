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
        // Drop existing table if it exists to start fresh with requested structure
        Schema::dropIfExists('dosens');

        Schema::create('dosens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // user_id linked to users table, nullable because some lecturers might not have accounts yet
            $table->foreignUuid('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            
            // 1. Data Identitas Pribadi
            $table->string('nama_lengkap', 150);
            $table->enum('jenis_kelamin', ['L', 'P']); // L/P
            $table->string('tempat_lahir', 100);
            $table->date('tanggal_lahir');
            
            // 2. Data Kepegawaian & ID
            $table->string('nip', 50)->nullable();
            $table->string('nidn', 50)->nullable();
            $table->string('nuptk', 50)->nullable();
            $table->string('nidk', 50)->nullable();
            $table->date('tmt_nidk_terbit')->nullable();
            $table->string('unit_kerja', 200)->nullable();
            $table->date('tmt_cpns')->nullable();
            $table->date('tmt_pensiun')->nullable();

            // 3. Data Kepangkatan & Jabatan
            $table->string('pangkat', 100)->nullable();
            $table->string('golongan', 50)->nullable();
            $table->date('tmt_pangkat')->nullable();
            $table->string('masa_kerja_pangkat', 100)->nullable();
            $table->string('jabatan_fungsional', 100)->nullable();
            $table->date('tmt_fungsional')->nullable();
            $table->string('masa_kerja_fungsional', 100)->nullable();
            $table->string('masa_kerja_keseluruhan', 100)->nullable();

            // 4. Data Akademik
            $table->string('departemen_bagian', 150)->nullable();
            $table->string('home_base', 150)->nullable();
            $table->string('pendidikan_terakhir', 100)->nullable();
            $table->string('bidang_keahlian', 150)->nullable();
            $table->integer('tahun_lulus')->nullable();
            $table->integer('tingkat_pendidik')->nullable(); // Using integer as requested

            // 5. Kolom Logika Aplikasi
            $table->enum('kategori_dosen', ['Dosen NIDN', 'Dosen NIDK'])->index();

            // Audit Trail
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dosens');
    }
};
