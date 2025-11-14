<?php

namespace App\Models;

use App\Enum\ConteudoStatusEnum;
use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conteudo extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Columns that can be mass assigned.
     *
     *
     */
    protected $fillable = [
        "topico",
        "conteudo",
        "status",
        "motivo_reprovacao"
    ];


    /**
     * The attributes that should be cast.
     *
     *
     */
    protected $casts = [
        'id' => 'integer',
        'status' => ConteudoStatusEnum::class,
    ];

    /**
     * The model's default values for attributes.
     *
     *
     */
    protected $attributes = [
        'status' => ConteudoStatusEnum::ESCRITO,
    ];

    /**
     * Approve the content.
     *
     *
     * @throws Exception
     */
    public function aprovar(): bool
    {

        if ($this->status !== ConteudoStatusEnum::ESCRITO) {

            throw new Exception('Ação de aprovar não permitida para o estado atual.');
        }

        $this->status = ConteudoStatusEnum::APROVADO;
        $this->motivo_reprovacao = null;

        return $this->save();
    }

    /**
     * Reject the content with a reason.
     *
     *
     * @throws Exception
     */
    public function reprovar(string $motivo_reprovacao): bool
    {

        if ($this->status !== ConteudoStatusEnum::ESCRITO) {
            throw new Exception('Ação de reprovar não permitida para o estado atual.');
        }
        if (empty($motivo_reprovacao)) {
            throw new Exception('O motivo da reprovação é obrigatório.');
        }

        $this->status = ConteudoStatusEnum::REPROVADO;
        $this->motivo_reprovacao = $motivo_reprovacao;

        return $this->save();
    }

    /**
     * Set status to ESCRITO after editing rejected content.
     *
     *
     * @throws Exception
     */
    public function statusEscritoAposEditarConteudoReprovado (): bool
    {
        if ($this->status !== ConteudoStatusEnum::REPROVADO) {
            throw new Exception('O Conteúdo não foi reprovado, ação não disponível.');
        }

        $this->status = ConteudoStatusEnum::ESCRITO;
        $this->motivo_reprovacao = null;

        return $this->save();
    }
}
