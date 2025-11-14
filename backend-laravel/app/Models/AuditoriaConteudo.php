<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditoriaConteudo extends Model
{
    use HasFactory;

    /**
     * Columns that can be mass assigned.
     *
     *
     */
    protected $fillable = [
        'conteudo_id',
        'acao',
        'detalhes',
    ];



}
