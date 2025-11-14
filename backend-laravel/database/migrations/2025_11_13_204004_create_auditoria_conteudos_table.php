<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('auditoria_conteudos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('conteudo_id')->constrained('conteudos')->cascadeOnDelete();
            $table->string('acao', 100);
            $table->text('detalhes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_conteudos');
    }
};
