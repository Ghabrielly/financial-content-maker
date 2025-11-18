<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use App\Models\Conteudo;
use App\Models\AuditoriaConteudo;
use App\Enum\ConteudoStatusEnum;
use App\Enum\AuditoriaAcaoEnum;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Exception;


class GerarConteudoIA implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    protected string $topic;
    protected $userId;
    public int $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(string $topic, $userId)
    {
        $this->topic = $topic;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     * Tenta gerar conteúdo usando um serviço de IA externo e salva no banco de dados.
     * @throws \Exception
     */
    public function handle(): void
    {
        $AGENT_URL = env("IA_AGENT_URL");

        if (!$AGENT_URL) {
            throw new \Exception('AGENT_URL não está no .env.');
        }

        try {
            $response = Http::timeout($this -> timeout - 10)
                ->post($AGENT_URL . '/analyze', [
                    'topic' => $this->topic,
                ]);

            $response->throw();

            $materiaGerada = $response->json('result');

            if (empty($materiaGerada)) {
                throw new \Exception('Nenhuma resposta foi gerada.');
            }

            $conteudo = Conteudo::create([
                'topico' => $this->topic,
                'conteudo' => $materiaGerada,
                'status' => ConteudoStatusEnum::ESCRITO,
                'motivo_reprovacao' => null
            ]);

            AuditoriaConteudo::create([
                'conteudo_id' => $conteudo->id,
                'user_id' => $this->userId,
                'acao' => AuditoriaAcaoEnum::CRIAR,
                'detalhes' => 'Conteúdo criado automaticamente pelo sistema de IA.'
            ]);

            Log::info("Conteúdo gerado com sucesso para o tópico '{$this->topic}' e ID do conteúdo {$conteudo->id}.");

        } catch (Exception $e) {
            Log::error("Falha no trabalho GerarConteudoIA contendo o tópico  '{$this->topic}' " . $e->getMessage());
            $this->fail($e);
        }
    }
}
