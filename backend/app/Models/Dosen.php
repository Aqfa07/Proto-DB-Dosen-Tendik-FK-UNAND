<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dosen extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'nip',
        'nidn',
        'nuptk',
        'nidk',
        'tmt_nidk_terbit',
        'unit_kerja',
        'tmt_cpns',
        'tmt_pensiun',
        'pangkat',
        'golongan',
        'tmt_pangkat',
        'masa_kerja_pangkat',
        'jabatan_fungsional',
        'tmt_fungsional',
        'masa_kerja_fungsional',
        'masa_kerja_keseluruhan',
        'departemen_bagian',
        'home_base',
        'pendidikan_terakhir',
        'bidang_keahlian',
        'tahun_lulus',
        'tingkat_pendidik',
        'kategori_dosen',
        'created_by',
        'updated_by',
    ];

    protected $appends = ['usia'];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'tmt_nidk_terbit' => 'date',
            'tmt_cpns' => 'date',
            'tmt_pangkat' => 'date',
            'tmt_fungsional' => 'date',
            'tmt_pensiun' => 'date',
            'tahun_lulus' => 'integer',
            'tingkat_pendidik' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
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
}

