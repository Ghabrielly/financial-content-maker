<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\ConteudoController;

/*
 * Routes to manage authentication (login, register).
 *
 */
Route::post('/login', [TokenController::class, 'issue'])
    ->name('token.issue');
Route::post('/register', [UserController::class, 'store'])
    ->name('user.store');

/*
 * Routes to manage "conteudos".
 *
 */
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [TokenController::class, 'destroy'])->name('token.destroy');

    Route::post('/conteudos/gerar', [ConteudoController::class, 'gerar'])
        ->name('conteudos.gerar');

    Route::get('/conteudos', [ConteudoController::class, 'index'])
        ->name('conteudos.index');

    Route::get('/conteudos/{conteudo}', [ConteudoController::class, 'show'])
        ->name('conteudos.show');

    Route::put('/conteudos/{conteudo}', [ConteudoController::class, 'update'])
        ->name('conteudos.update');

    Route::delete('/conteudos/{conteudo}', [ConteudoController::class, 'destroy'])
        ->name('conteudos.destroy');

    Route::post('/conteudos/{conteudo}/aprovar', [ConteudoController::class, 'aprovar'])
        ->name('conteudos.aprovar');

    Route::post('/conteudos/{conteudo}/reprovar', [ConteudoController::class, 'reprovar'])
        ->name('conteudos.reprovar');
});
