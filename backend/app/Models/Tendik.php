<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tendik extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'department_id',
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'nip_baru',
        'golongan_cpns',
        'tmt_cpns',
        'golongan_pangkat',
        'tmt_pangkat',
        'nama_jabatan',
        'tmt_jabatan',
        'tanggal_mulai_tugas_unit',
        'tanggal_mulai_keseluruhan',
        'tanggal_mulai_golongan',
        'nama_pendidikan',
        'tahun_lulus',
        'tingkat_ijazah',
        'tmt_pensiun',
        'tahun_pensiun',
        'batas_usia_pensiun',
        'created_by',
        'updated_by',
    ];

    protected $appends = ['usia', 'masa_kerja_tugas_unit_tahun', 'masa_kerja_keseluruhan_tahun', 'masa_kerja_golongan_tahun'];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'tmt_cpns' => 'date',
            'tmt_pangkat' => 'date',
            'tmt_jabatan' => 'date',
            'tanggal_mulai_tugas_unit' => 'date',
            'tanggal_mulai_keseluruhan' => 'date',
            'tanggal_mulai_golongan' => 'date',
            'tmt_pensiun' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function diklat()
    {
        return $this->hasMany(TendikDiklat::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getUsiaAttribute()
    {
        return $this->tanggal_lahir ? $this->tanggal_lahir->age : null;
    }

    public function getMasaKerjaTugasUnitTahunAttribute()
    {
        return $this->tanggal_mulai_tugas_unit ? $this->tanggal_mulai_tugas_unit->diffInYears(now()) : null;
    }

    public function getMasaKerjaKeseluruhanTahunAttribute()
    {
        return $this->tanggal_mulai_keseluruhan ? $this->tanggal_mulai_keseluruhan->diffInYears(now()) : null;
    }

    public function getMasaKerjaGolonganTahunAttribute()
    {
        return $this->tanggal_mulai_golongan ? $this->tanggal_mulai_golongan->diffInYears(now()) : null;
    }
}
