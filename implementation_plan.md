# Rencana Implementasi Fitur Tersisa (FK UNAND)

Deskripsi: Dokumen ini merangkum rencana implementasi kode untuk merealisasikan fitur-fitur tersisa secara maksimal dan tanpa cela guna melengkapi Sistem Database Dosen dan Tendik FK UNAND.

## User Review Required

> [!IMPORTANT]
> Mohon diperhatikan bahwa implementasi *Excel Export/Import* akan membutuhkan instalasi paket `maatwebsite/excel` di sisi *Backend* menggunakan Composer. Saya akan menjalankannya secara otomatis apabila Anda menyetujui rencana ini.

## Proposed Changes

### 1. Fitur Export/Import Excel (Dosen & Tendik)

#### [NEW] `App\Exports\DosenExport` & `TendikExport`
- Kelas *Export* Laravel Excel untuk mengekspor data Dosen/Tendik dengan format header yang rapi.

#### [NEW] `App\Imports\DosenImport` & `TendikImport`
- Kelas *Import* Laravel Excel untuk memvalidasi dan memasukkan data massal dari Excel ke *Database*.

#### [MODIFY] `App\Http\Controllers\Api\DosenController.php` & [TendikController.php](file:///d:/laragon/www/Database%20Dosen%20dan%20Tendik/backend/app/Http/Controllers/Api/TendikController.php)
- Menambahkan *method* `export()` (mengembalikan file XLSX) dan `import()` (menerima file multipart/form-data).

#### [MODIFY] [dosen/page.tsx](file:///d:/laragon/www/Database%20Dosen%20dan%20Tendik/frontend/src/app/%28dashboard%29/dosen/page.tsx) & [tendik/page.tsx](file:///d:/laragon/www/Database%20Dosen%20dan%20Tendik/frontend/src/app/%28dashboard%29/tendik/page.tsx) (Frontend)
- Menambahkan UI tombol "Unduh Excel" dan "Unggah Excel" dengan indikator *Loading*.

---

### 2. Paginasi & Filter Lanjutan

#### [MODIFY] Frontend Stores ([useDosenStore.ts](file:///d:/laragon/www/Database%20Dosen%20dan%20Tendik/frontend/src/store/useDosenStore.ts), [useTendikStore.ts](file:///d:/laragon/www/Database%20Dosen%20dan%20Tendik/frontend/src/store/useTendikStore.ts))
- Memperbarui *interface* State untuk mencakup metadata paginasi (`current_page`, `last_page`, `total`).
- Meneruskan argumen parameter string `?page=X` pada klien Axios.

#### [MODIFY] Frontend UI ([dosen/page.tsx](file:///d:/laragon/www/Database%20Dosen%20dan%20Tendik/frontend/src/app/%28dashboard%29/dosen/page.tsx), [tendik/page.tsx](file:///d:/laragon/www/Database%20Dosen%20dan%20Tendik/frontend/src/app/%28dashboard%29/tendik/page.tsx))
- Menambahkan komponen navigasi halaman (Prev, Next, Page Numbers) di bawah tabel.
- Mengimplementasikan *Dropdown* Filter (berdasarkan Departemen / Status).

---

### 3. Halaman Dasbor Admin: Arsip Triwulanan (Snapshots)

#### [NEW] `src/app/(dashboard)/snapshots/page.tsx`
- Membangun halaman antarmuka pengguna khusus Admin untuk merekam kinerja Dosen & Tendik di setiap akhir kuartal.
- Menambahkan tombol besar "Simpan Snapshot Triwulan Ini".

## Verification Plan

### Automated Tests
1. Memverifikasi API Endpoint dengan HTTP Test (Node.js/cURL) apabila direkomendasikan.
2. Memeriksa respon *HTTP Code 200/201* di Konsol Jaringan.

### Manual Verification
1. **Excel Integration:** Menguji pengunduhan file Dosen untuk memastikan berkas `.xlsx` tidak rusak, dan mengujinya kembali untuk di-*upload* ulang ke sistem.
2. **Pagination Test:** Menciptakan 15 entri data palsu via seeder, lalu memverifikasi apakah transisi halaman di komponen tabel Next.js berjalan tanpa me-*reload* seluruh DOM.
3. **Snapshot UI:** Mengakses menu `/snapshots`, menekan tombol "Arsipkan", dan memverifikasi *database* menyimpan riwayat di tabel `snapshot_dosens`.
