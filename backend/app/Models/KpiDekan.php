<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KpiDekan extends Model
{
    protected $fillable = [
        'tahun',
        'indikator',
        'target',
        'realisasi_q1',
        'realisasi_q2',
        'realisasi_q3',
        'realisasi_q4',
    ];

    protected function casts(): array
    {
        return [
            'target' => 'decimal:2',
            'realisasi_q1' => 'decimal:2',
            'realisasi_q2' => 'decimal:2',
            'realisasi_q3' => 'decimal:2',
            'realisasi_q4' => 'decimal:2',
        ];
    }

    /**
     * Hitung total realisasi dari Q1 sampai Q4.
     */
    public function getTotalRealisasiAttribute(): float
    {
        return (float)$this->realisasi_q1 + (float)$this->realisasi_q2
             + (float)$this->realisasi_q3 + (float)$this->realisasi_q4;
    }

    /**
     * Hitung persentase pencapaian terhadap target.
     */
    public function getPersentaseCapaianAttribute(): float
    {
        if ((float)$this->target <= 0) return 0;
        return round(($this->total_realisasi / (float)$this->target) * 100, 2);
    }

    protected $appends = ['total_realisasi', 'persentase_capaian'];
}
