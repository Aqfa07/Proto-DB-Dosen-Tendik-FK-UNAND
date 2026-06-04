# Rancangan Teknis Sistem Database Dosen dan Tendik FK UNAND

Dokumen ini berisi rancangan arsitektur, database, dan logika backend untuk membangun Sistem Informasi Database Dosen dan Tenaga Kependidikan (Tendik) Fakultas Kedokteran Universitas Andalas. Rancangan ini telah disesuaikan dengan kebutuhan *audit trail*, *soft delete*, pengelolaan *masa kerja dinamis*, serta *export/import data*.

## 1. Teknologi (Tech Stack) yang Direkomendasikan
*   **Frontend**: Next.js (React.js) dengan Tailwind CSS untuk antarmuka yang modern, dinamis, dan responsif.
*   **Backend Alternatif**: 
    *   **Opsi A (Ekosistem Node.js)**: NestJS (untuk arsitektur enterprise skala besar) atau Express.js (jika butuh yang lebih ringan dan cepat dikembangkan).
    *   **Opsi B (Ekosistem PHP - *Highly Recommended untuk Rapid Development*)**: **Laravel** sangat direkomendasikan jika tenggat waktu ketat. Laravel memiliki ekosistem bawaan yang sangat kuat untuk *Authentication*, *Eloquent ORM*, dan manajemen *Excel Export/Import* (via *Laravel Excel*/Maatwebsite), yang sangat cocok untuk kebutuhan administrasi akademik.
*   **Database**: PostgreSQL. Sangat kuat untuk relasi data yang kompleks dan memiliki dukungan tipe data `JSONB` yang sangat berguna untuk menyimpan arsip snapshot per triwulan.

---

## 2. Arsitektur Sistem & Alur UI/UX

**Alur UI/UX (Frontend)**:
1.  **Halaman Autentikasi**: Menggunakan Email/NIP dan kata sandi.
2.  **Dashboard Utama**:
    *   **Dekan**: *Chart* kinerja fakultas, distribusi status, grafik umur/gender.
    *   **Super Admin**: Statistik sistem, manajemen pengguna, log aktivitas *update*.
    *   **PJ Departemen**: Metrik departemen terkait dan indikator profil dosen/tendik yang butuh validasi.
3.  **Module Manajemen Dosen & Tendik**: Halaman tabel dengan fitur *Export/Import Excel*, *Advanced Filter*, dan riwayat modifikasi (*audit trail*).
4.  **Form Pembaruan Mandiri**: Borang (*Form*) multi-langkah (Stepped-form).
5.  **Manajemen Arsip (Triwulan)**: Penjelajah waktu (*Time Travel*) untuk melihat keadaan *database* pada titik waktu masa lampau.

---

## 3. Rancangan Role-Based Access Control (RBAC)

| Role | Izin & Akses Layar |
| :--- | :--- |
| **Super Admin** | CRUD semua data (*Soft Delete*). Melihat jejak Audit siapa yang mengedit data (Dosen/Tendik vs PJ). Eksekusi Export/Import massal. |
| **Dekan** | *Read-Only* untuk semua entitas fakultas. Akses eksklusif ke halaman _Dashboard Capaian Kinerja_. |
| **PJ Departemen / Bagian** | CRUD terbatas **hanya** untuk Dosen dan Tendik di Departemen/Bagian yang dikelolanya. |
| **Dosen / Tendik** | Membuat pengajuan "Pembaruan Mandiri" untuk datanya sendiri. |

---

## 4. Skema Database Relasional (SQL PostgreSQL)

Dilengkapi dengan *Soft Delete* (`deleted_at`) dan *Audit Trail* (`created_by`, `updated_by`) demi pelacakan keamanan dan *compliance* data pegawai institut pemerintah.

```sql
-- TABEL MANAJEMEN PENGGUNA & ROLE DEPARTEMEN --
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id),
    department_id INT REFERENCES departments(id) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- Soft Delete
);

-- ENTITAS 1: DOSEN --
CREATE TYPE status_dosen_enum AS ENUM ('NIDN', 'NIDK', 'PPPK', 'TIDAK_TETAP');
CREATE TYPE gender_enum AS ENUM ('L', 'P');

CREATE TABLE dosen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id),
    
    -- A. Identitas
    status_dosen status_dosen_enum NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    jenis_kelamin gender_enum NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    
    -- B. Identitas Pegawai
    nip VARCHAR(50) NULL,
    nuptk VARCHAR(50) NULL,
    nomor_induk_dosen VARCHAR(50) NULL,
    tmt_nidk_terbit DATE NULL,
    
    -- C. Kepangkatan dan Jabatan
    pangkat VARCHAR(50) NULL,
    golongan VARCHAR(20) NULL,
    jabatan_fungsional VARCHAR(100) NULL,
    tmt_cpns DATE NULL,
    tmt_pangkat DATE NULL,
    tmt_fungsional DATE NULL,
    
    -- D. Penempatan dan Akademik
    unit_kerja VARCHAR(100) NULL,
    homebase_bidang_utama VARCHAR(150) NULL,
    bidang_keahlian_spesifik VARCHAR(150) NULL,
    
    -- E. Pendidikan
    tingkat_pendidik VARCHAR(50) NULL,
    tahun_lulus INT NULL,
    tingkat_ijazah VARCHAR(50) NULL,
    
    -- F. TMT Masa Kerja (Agar dihitung dinamis)
    tanggal_mulai_keseluruhan DATE NULL,
    tmt_pensiun DATE NULL,
    
    -- Audit Trail & Soft Delete
    created_by UUID REFERENCES users(id) NULL,
    updated_by UUID REFERENCES users(id) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
CREATE INDEX idx_dosen_status ON dosen(status_dosen);
CREATE INDEX idx_dosen_dept ON dosen(department_id);


-- ENTITAS 2: TENDIK --
CREATE TABLE tendik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id),
    
    -- Identitas Pribadi & Kepegawaian
    nama_lengkap VARCHAR(150) NOT NULL,
    jenis_kelamin gender_enum NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    nip_baru VARCHAR(50) NOT NULL,
    
    -- Riwayat CPNS & Pangkat
    golongan_cpns VARCHAR(20) NULL,
    tmt_cpns DATE NULL,
    golongan_pangkat VARCHAR(20) NULL,
    tmt_pangkat DATE NULL,
    nama_jabatan VARCHAR(100) NULL,
    tmt_jabatan DATE NULL,
    
    -- F. TMT Rincian Masa Kerja (Untuk perhitungan On The Fly)
    tanggal_mulai_tugas_unit DATE NULL,
    tanggal_mulai_keseluruhan DATE NULL,
    tanggal_mulai_golongan DATE NULL,
    
    -- Pendidikan & Pensiun
    nama_pendidikan VARCHAR(100) NULL,
    tahun_lulus INT NULL,
    tingkat_ijazah VARCHAR(50) NULL,
    tmt_pensiun DATE NULL,
    tahun_pensiun INT NULL,
    batas_usia_pensiun INT NULL,
    
    -- Audit Trail & Soft Delete
    created_by UUID REFERENCES users(id) NULL,
    updated_by UUID REFERENCES users(id) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- TABEL RELASI: RIWAYAT DIKLAT TENDIK (One-to-Many) --
CREATE TABLE tendik_diklat (
    id SERIAL PRIMARY KEY,
    tendik_id UUID REFERENCES tendik(id) ON DELETE CASCADE,
    nama_latihan VARCHAR(255) NOT NULL,
    bulan_pelaksanaan INT NOT NULL CHECK (bulan_pelaksanaan BETWEEN 1 AND 12),
    tahun_pelaksanaan INT NOT NULL,
    jumlah_jam INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- MANAJEMEN ARSIP TRIWULAN (VERSIONING / QUARTERLY UPDATES HISTORY) --
CREATE TABLE quarterly_snapshots (
    id SERIAL PRIMARY KEY,
    quarter_label VARCHAR(10) NOT NULL, -- e.g., '2026-Q1'
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, FINALIZED
    created_by UUID REFERENCES users(id) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE snapshot_dosen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id INT REFERENCES quarterly_snapshots(id) ON DELETE CASCADE,
    dosen_id UUID,
    data_snapshot JSONB NOT NULL 
);

CREATE TABLE snapshot_tendik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id INT REFERENCES quarterly_snapshots(id) ON DELETE CASCADE,
    tendik_id UUID,
    data_snapshot JSONB NOT NULL
);
```

---

## 5. Logika Backend untuk Penghitungan Automatik & Triwulanan

### A. Soft Delete Implementation
Untuk mencegah data penting akademik terhapus secara permanen (*Hard Delete*), setiap `DELETE` request hanya akan mengubah kolom `deleted_at` ke waktu saat ini.
*   **Query Umum**: Semua operasi `SELECT` secara default akan ditambahkan klausa `WHERE deleted_at IS NULL`. (Di Laravel, ini sudah otomatis dari fitur *SoftDeletes* pada model).

### B. Audit Trail (Tracking Update)
Sistem melacak siapa penanggungjawab terakhir pada setiap baris data Dosen/Tendik:
*   Jika Dosen melakukan *Self-Update*, `updated_by` akan merekam ID _User_ Dosen tersebut.
*   Jika PJ Departemen melakukan revisi atas data yang salah, ID PJ akan tercatat sehingga jejak akuntabilitas terlihat bagi Super Admin.

### C. Penghitungan Masa Kerja & Usia Dinamis (*On The Fly*)
Nilai **Usia** dan **Masa Kerja** tidak lagi dikunci dalam bentuk integer bulan lalu disimpan ke database. Sebaliknya:
*   Kita menggunakan kolom historikal statis seperti `tanggal_lahir`, `tanggal_mulai_tugas_unit`, `tmt_pangkat`.
*   Backend mengeksekusi perhitungan beda waktu `(Tanggal Sekarang - Tanggal Parameter)` secara dinamis setiap kali request `GET` dijalankan.

### D. Pembaruan Data Triwulan (Quarterly Updates System)
Terdapat mekanisme arsip akhir Triwulan: Admin menekan tombol "Akhiri Kuartal Q{X}". Backend me-generate data Dosen dan Tendik saat detik itu menjadi `JSONB` di tabel `snapshot`.

---

## 6. Daftar Route Endpoint API Terpilih

| Method | Endpoint | Fungsi Otorisasi & Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Validasi *credentials* & menghasilkan JWT Token. |
| `GET`  | `/api/dashboard/summary` | (Khusus Dekan/Admin) Menghasilkan analitik KPI Fakultas. |
| `GET`  | `/api/dosen` | Fetch tabel Dosen (`deleted_at IS NULL`). |
| `POST` | `/api/dosen` | (Khusus Admin/PJ) Menambahkan Dosen baru. |
| `PUT`  | `/api/dosen/:id` | (Admin/PJ/Mandiri Self-Update) Mengubah detail data Dosen. Mengubah `updated_by`. |
| `DELETE`| `/api/dosen/:id` | (Khusus Admin) **Soft Delete** (Set `deleted_at`). |
| `GET`  | `/api/dosen/export`| (Khusus Admin/PJ) Download data Dosen dalam format **.xlsx** atau **.csv**. |
| `POST` | `/api/dosen/import`| (Khusus Admin) Bulk insert data Dosen dari file Excel awal. |
| `POST` | `/api/snapshots/finalize` | (Khusus Super Admin) Me-generate *History Log* JSON quarter tsb.|
