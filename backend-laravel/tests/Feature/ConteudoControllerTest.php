<?php

use App\Enum\AuditoriaAcaoEnum;
use App\Enum\ConteudoStatusEnum;
use App\Jobs\GerarConteudoIA;
use App\Models\AuditoriaConteudo;
use App\Models\Conteudo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;

uses(RefreshDatabase::class);

it('can list all conteudos with pagination', function () {
    Conteudo::factory()->count(15)->create();

    $response = $this->getJson('/api/conteudos?per_page=5');

    $response->assertStatus(200)
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('total', 15);
});

it('can filter conteudos by status', function () {
    Conteudo::factory()->create(['status' => ConteudoStatusEnum::ESCRITO]);
    Conteudo::factory()->count(2)->create(['status' => ConteudoStatusEnum::APROVADO]);

    $response = $this->getJson('/api/conteudos?status=' . ConteudoStatusEnum::ESCRITO->name);

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.status', ConteudoStatusEnum::ESCRITO->name);
});

it('can start the content generation process', function () {
    Bus::fake();
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/conteudos/gerar', [
        'topico' => 'Inteligência Artificial no Desenvolvimento de Software'
    ]);

    $response->assertStatus(202)
        ->assertJson(['message' => 'Geração de conteúdo iniciada. O conteúdo será criado assim que estiver pronto.']);

    Bus::assertDispatched(GerarConteudoIA::class);
});

it('fails to start generation without a topic', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/conteudos/gerar', ['topico' => '']);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('topico');
});

it('can show a specific conteudo', function () {
    $conteudo = Conteudo::factory()->create();

    $response = $this->getJson("/api/conteudos/{$conteudo->id}");

    $response->assertStatus(200)
        ->assertJsonFragment(['id' => $conteudo->id]);
});

it('can approve a conteudo', function () {
    $user = User::factory()->create();
    $conteudo = Conteudo::factory()->create(['status' => ConteudoStatusEnum::ESCRITO]);

    $response = $this->actingAs($user)->postJson("/api/conteudos/{$conteudo->id}/aprovar");

    $response->assertStatus(200)
        ->assertJsonFragment(['status' => ConteudoStatusEnum::APROVADO->name]);

    $this->assertDatabaseHas('conteudos', [
        'id' => $conteudo->id,
        'status' => ConteudoStatusEnum::APROVADO->name
    ]);

    $this->assertDatabaseHas('auditoria_conteudos', [
        'conteudo_id' => $conteudo->id,
        'user_id' => $user->id,
        'acao' => AuditoriaAcaoEnum::APROVAR->name
    ]);
});

it('can reprove a conteudo', function () {
    $user = User::factory()->create();
    $conteudo = Conteudo::factory()->create(['status' => ConteudoStatusEnum::ESCRITO]);
    $motivo = 'O conteúdo não atende aos critérios de qualidade estabelecidos.';

    $response = $this->actingAs($user)->postJson("/api/conteudos/{$conteudo->id}/reprovar", [
        'motivo_reprovacao' => $motivo
    ]);

    $response->assertStatus(200)
        ->assertJsonFragment(['status' => ConteudoStatusEnum::REPROVADO->name]);

    $this->assertDatabaseHas('conteudos', [
        'id' => $conteudo->id,
        'status' => ConteudoStatusEnum::REPROVADO->name,
        'motivo_reprovacao' => $motivo
    ]);

    $this->assertDatabaseHas('auditoria_conteudos', [
        'conteudo_id' => $conteudo->id,
        'user_id' => $user->id,
        'acao' => AuditoriaAcaoEnum::REPROVAR->name,
        'detalhes' => 'Motivo: ' . $motivo
    ]);
});

it('can update a conteudo', function () {
    $user = User::factory()->create();
    $conteudo = Conteudo::factory()->create(['status' => ConteudoStatusEnum::ESCRITO]);
    $novoTexto = 'Este é o novo texto do conteúdo, devidamente atualizado pelo revisor.';

    $response = $this->actingAs($user)->putJson("/api/conteudos/{$conteudo->id}", [
        'conteudo' => $novoTexto
    ]);

    $response->assertStatus(200)
        ->assertJsonFragment(['conteudo' => $novoTexto]);

    $this->assertDatabaseHas('conteudos', [
        'id' => $conteudo->id,
        'conteudo' => $novoTexto
    ]);

    $this->assertDatabaseHas('auditoria_conteudos', [
        'conteudo_id' => $conteudo->id,
        'user_id' => $user->id,
        'acao' => AuditoriaAcaoEnum::EDITAR->name
    ]);
});

it('cannot update an approved conteudo', function () {
    $user = User::factory()->create();
    $conteudo = Conteudo::factory()->create(['status' => ConteudoStatusEnum::APROVADO]);

    $response = $this->actingAs($user)->putJson("/api/conteudos/{$conteudo->id}", [
        'conteudo' => 'Tentativa de edição de conteúdo aprovado.'
    ]);

    $response->assertStatus(422)
        ->assertJson(['error' => 'Conteúdos aprovados não podem ser editados.']);
});

it('can delete a conteudo', function () {
    $user = User::factory()->create();
    $conteudo = Conteudo::factory()->create(['status' => ConteudoStatusEnum::ESCRITO]);

    $response = $this->actingAs($user)->deleteJson("/api/conteudos/{$conteudo->id}");

    $response->assertStatus(204);

    $this->assertSoftDeleted('conteudos', ['id' => $conteudo->id]);

    $this->assertDatabaseHas('auditoria_conteudos', [
        'conteudo_id' => $conteudo->id,
        'user_id' => $user->id,
        'acao' => AuditoriaAcaoEnum::DELETAR->name
    ]);
});

it('cannot delete an approved conteudo', function () {
    $user = User::factory()->create();
    $conteudo = Conteudo::factory()->create(['status' => ConteudoStatusEnum::APROVADO]);

    $response = $this->actingAs($user)->deleteJson("/api/conteudos/{$conteudo->id}");

    $response->assertStatus(422)
        ->assertJson(['error' => 'Conteúdos aprovados não podem ser excluídos.']);
});
