<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TendikDiklat extends Model
{
    protected $fillable = [
        'tendik_id',
        'nama_latihan',
        'bulan_pelaksanaan',
        'tahun_pelaksanaan',
        'jumlah_jam',
    ];

    public function tendik()
    {
        return $this->belongsTo(Tendik::class);
    }
}
