# financial-content-maker

Serviço de geração de conteúdo financeiro.

## Requisitos
- Docker
- Docker Compose
- Git

## Primeiros passos
1. Clonar o repositório e entrar na pasta:
```bash
git clone git@github.com:cassimirodev/financial-content-maker.git
cd financial-content-maker
```

2. Subir containers (build):
```bash

```

3. Rodar comandos dentro do container do Laravel (prefira `docker exec <nome_container> <comando>`):
```bash
docker exec backend-laravel composer install
docker exec backend-laravel cp .env.example .env
docker exec backend-laravel php artisan key:generate
docker exec backend-laravel php artisan migrate --seed
```
Observação: use `docker ps` para ver os nomes dos containers.

## Comandos úteis
- Ver logs:
```bash
docker compose logs -f
```
- Executar testes:
```bash
docker exec backend-laravel php artisan test
```
- Recriar serviço específico:
```bash
docker compose up -d --build <servico>
```
- Entrar no shell interativo do container:
```bash
docker exec -it backend-laravel bash
```

## Endpoints
- Serviço de agentes:
  - Docs: http://localhost:8001/docs
- Laravel:
  - Docs: http://localhost:8080/docs/api#/

Ajuste de porta/host pode ser necessário dependendo do `docker-compose.yml`.

## Variáveis de ambiente
- Copie `.env.example` para `.env` (no container ou local, conforme sua configuração de volume).
- Verifique credenciais de banco e outros serviços em `.env`.
- Gere a APP_KEY com `php artisan key:generate` dentro do container.

## Banco de dados
- Executar migrations e seeders:
```bash
docker exec backend-laravel php artisan migrate --seed
```
- Resetar banco:
```bash
docker exec backend-laravel php artisan migrate:fresh --seed
```
Observação: CUIDADO! ao adicionar `:fresh` no comando de migrate, resetará todo seu schema do banco, resultando na perca dos dados persistidos.

## Fluxo de desenvolvimento
- Recomenda-se criar uma branch de desenvolvimento (`dev`) e abrir PRs para a branch principal (main).
- Utilizar commits semânticos com o objetivo de melhorar o entendimento do que foi feito.


## Estrutura do repositório
Abaixo a estrutura principal do projeto:

```
.
├── analyzer_agents
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── src
│   └── tests
├── backend-laravel
│   ├── app
│   ├── artisan
│   ├── bootstrap
│   ├── composer.json
│   ├── composer.lock
│   ├── config
│   ├── database
│   ├── Dockerfile
│   ├── package.json
│   ├── phpunit.xml
│   ├── public
│   ├── README.md
│   ├── resources
│   ├── routes
│   ├── storage
│   ├── tests
│   ├── vendor
│   └── vite.config.js
├── docker-compose.yaml
└── README.md
```

## Troubleshooting rápido
- Container não sobe: verifique `docker compose logs <servico>` e ajuste volumes/permissões.
- Comandos artisan não encontrados: confirme o nome do container com `docker ps` e execute `docker exec <container> php artisan`.
- Porta ocupada: ajuste portas no `docker-compose.yml` ou pare o serviço que estiver usando a porta.
