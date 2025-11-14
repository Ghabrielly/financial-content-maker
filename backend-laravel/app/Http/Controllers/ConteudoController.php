<?php

namespace App\Http\Controllers;

use App\Enum\AuditoriaAcaoEnum;
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

        $perPage = (int) $request->input('per_page', 10);
        $conteudos = $query->paginate($perPage);

        return response()->json($conteudos, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ConteudoRequest $request): JsonResponse
    {
        $conteudo = Conteudo::create($request->validated());

        AuditoriaConteudo::create([
            'conteudo_id' => $conteudo->id,
            'acao' => AuditoriaAcaoEnum::CRIAR,
        ]);

        return response()->json($conteudo, 201);
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
        try {
            $validated = $request->validate(['motivo_reprovacao' => 'required|string']);
            /** @var array{motivo_reprovacao: string} $validated */

            $conteudo->reprovar($validated['motivo_reprovacao']);

            AuditoriaConteudo::create([
                'conteudo_id' => $conteudo->id,
                'acao' => AuditoriaAcaoEnum::REPROVAR,
                'detalhes' => 'Motivo: ' . $validated['motivo_reprovacao'],
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
            if (isset($data['conteudo'])) {
                $conteudo->statusEscritoAposEditarConteudoReprovado();
            }

            $conteudo->update($data);
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
            'acao' => AuditoriaAcaoEnum::DELETAR,
        ]);

        return response()->json(null, 204);
    }
}
