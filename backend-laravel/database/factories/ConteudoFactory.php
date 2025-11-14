<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conteudo>
 */
class ConteudoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['ESCRITO', 'APROVADO', 'REPROVADO'];
        $status = $this->faker->randomElement($statuses);

        return [
            'topico' => $this->faker->sentence(3),
            'conteudo' => $this->faker->paragraphs(3, true),
            'status' => $status,
            'motivo_reprovacao' => $status === 'REPROVADO' ? $this->faker->sentence() : null,
        ];
    }
}
