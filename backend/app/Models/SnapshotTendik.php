<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SnapshotTendik extends Model
{
    use HasUuids;

    protected $fillable = [
        'snapshot_id',
        'tendik_id',
        'data_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'data_snapshot' => 'array',
        ];
    }

    public function snapshot()
    {
        return $this->belongsTo(QuarterlySnapshot::class, 'snapshot_id');
    }

    public function tendik()
    {
        return $this->belongsTo(Tendik::class);
    }
}
