<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function dosens()
    {
        return $this->hasMany(Dosen::class);
    }

    public function tendiks()
    {
        return $this->hasMany(Tendik::class);
    }
}
