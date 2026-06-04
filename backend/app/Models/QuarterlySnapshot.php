<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuarterlySnapshot extends Model
{
    protected $fillable = [
        'quarter_label',
        'status',
        'created_by',
    ];

    public function snapshotDosens()
    {
        return $this->hasMany(SnapshotDosen::class, 'snapshot_id');
    }

    public function snapshotTendiks()
    {
        return $this->hasMany(SnapshotTendik::class, 'snapshot_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
