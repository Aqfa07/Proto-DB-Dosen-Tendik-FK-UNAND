<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SnapshotDosen extends Model
{
    use HasUuids;

    protected $fillable = [
        'snapshot_id',
        'dosen_id',
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

    public function dosen()
    {
        return $this->belongsTo(Dosen::class);
    }
}
