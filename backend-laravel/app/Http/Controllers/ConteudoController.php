<?php

namespace App\Http\Controllers;

use App\Enum\AuditoriaAcaoEnum;
use App\Http\Requests\GeracaoRequest;
use App\Models\Conteudo;
use App\Models\AuditoriaConteudo;
use App\Http\Requests\ConteudoRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Enum\ConteudoStatusEnum;
use Throwable;

class ConteudoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Conteudo::query();

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('topico')) {
            $query->where('topico', $request->input('topico'));
        }

        $query->orderBy('created_at', 'desc');
        $perPage = (int) $request->input('per_page', 10);
        $conteudos = $query->paginate($perPage);

        return response()->json($conteudos, 200);
    }

    /**
     * Start the content generation process.
     */
    public function gerar(GeracaoRequest $request): JsonResponse
    {
        $topic = $request->validated('topico');
        $userId = Auth::id();

        GerarConteudoIA::dispatch($topic, $userId);

        return response()->json(
            ['message' => 'Geração de conteúdo iniciada. O conteúdo será criado assim que estiver pronto.'],
            202
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Conteudo $conteudo): JsonResponse
    {
        return response()->json($conteudo, 200);
    }

    /**
     * Aprova um conteúdo específico.
     */
    public function aprovar(Conteudo $conteudo): JsonResponse
    {
        try {
            $conteudo->aprovar();

            AuditoriaConteudo::create([
                'conteudo_id' => $conteudo->id,
                'user_id' => Auth::id(),
                'acao' => AuditoriaAcaoEnum::APROVAR,
            ]);
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json($conteudo->fresh(), 200);
    }

    /**
     * Reprova um conteúdo específico.
     */
    public function reprovar(Request $request, Conteudo $conteudo): JsonResponse
    {

        $motivo = $request->validated('motivo_reprovacao');

        try {
            $conteudo->reprovar($motivo);

            AuditoriaConteudo::create([
                'conteudo_id' => $conteudo->id,
                'user_id' => Auth::id(),
                'acao' => AuditoriaAcaoEnum::REPROVAR,
                'detalhes' => 'Motivo: ' . $motivo,
            ]);

        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json($conteudo->fresh(), 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ConteudoRequest $request, Conteudo $conteudo): JsonResponse
    {
        $data = $request->validated();

        try {

            if ($conteudo->status === ConteudoStatusEnum::REPROVADO) {
                $conteudo->statusEscritoAposEditarConteudoReprovado();
            }

            $conteudo->update($data);

            AuditoriaConteudo::create([
                'conteudo_id' => $conteudo->id,
                'user_id' => Auth::id(),
                'acao' => AuditoriaAcaoEnum::EDITAR,
                'detalhes' => 'Conteúdo editado pelo revisor.'
            ]);

        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json($conteudo->fresh(), 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Conteudo $conteudo): JsonResponse
    {
        if ($conteudo->status === ConteudoStatusEnum::APROVADO) {
            return response()->json(['error' => 'Conteúdos aprovados não podem ser excluídos.'], 422);
        }

        $conteudoId = $conteudo->id;
        $conteudo->delete();

        AuditoriaConteudo::create([
            'conteudo_id' => $conteudoId,
            'user_id' => Auth::id(),
            'acao' => AuditoriaAcaoEnum::DELETAR,
            'detalhes' => 'Conteúdo excluído pelo revisor.'
        ]);

        return response()->json(null, 204);
    }
}
