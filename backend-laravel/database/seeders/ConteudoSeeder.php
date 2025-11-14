<?php

namespace Database\Seeders;

use Database\Factories\ConteudoFactory;
use Illuminate\Database\Seeder;


class ConteudoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Conteudo::factory()->count(10)->create();
    }
}
