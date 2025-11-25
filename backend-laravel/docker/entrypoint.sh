#!/bin/bash
set -e

echo "Iniciando container..."

if [ ! -f "vendor/autoload.php" ]; then
    echo "Vendor não encontrado. Instalando dependências..."
    composer install --no-progress --no-interaction
else
    echo "Vendor já existe."
fi

if [ ! -f ".env" ]; then
    echo "Arquivo .env não encontrado. Criando a partir do exemplo..."
    cp .env.example .env
    php artisan key:generate
else
    echo "Arquivo .env já existe."
fi

echo "Executando comando: $@"
exec "$@"
