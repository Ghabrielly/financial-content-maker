# Autenticação - Guia de Uso

## 📋 Fluxo de Autenticação

### 1. **Cadastro** (`cadastro.html`)
- Acesse: `https://<seu-dominio>/cadastro.html`
- Preencha: Nome, Email, Senha
- Clique em "Cadastrar"
- Se sucesso → Será redirecionado para a página de login

### 2. **Login** (`index.html`)
- Acesse: `https://<seu-dominio>/index.html`
- Preencha: Email e Senha (do cadastro)
- Clique em "Entrar"
- Se sucesso:
  - Token é salvo no `localStorage` como `authToken`
  - Será redirecionado para `dashboard.html` (em desenvolvimento)

## 🔐 Gerenciamento de Token

### Funções disponíveis em `script/auth.js`:

```javascript
// Salvar token
salvarToken("seu-token-aqui");

// Obter token
const token = obterToken();

// Verificar se está autenticado
if (estaAutenticado()) {
  // Usuário está logado
}

// Obter headers com autenticação
const headers = obterHeadersComAuth();
// Retorna: { "Content-Type": "application/json", "Authorization": "Bearer token..." }

// Fazer logout
fazerLogout();
```

## 🧪 Testando o Fluxo

### Opção 1: Interface (recomendado)
1. Cadastre um usuário em `cadastro.html`
2. Faça login em `index.html`
3. Abra o DevTools (F12)
4. Console → Execute: `obterToken()` → Verá o token salvo

### Opção 2: Terminal com cURL

**Cadastro:**
```bash
curl -X POST https://<seu-dominio>/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@test.com",
    "password": "senha123",
    "password_confirmation": "senha123"
  }'
```

**Login:**
```bash
curl -X POST https://<seu-dominio>/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@test.com",
    "password": "senha123",
    "device_name": "mobile"
  }'
```

Resposta:
```json
{
  "token": "1|abc123defg...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@test.com"
  }
}
```

## 🚀 Usando o Token em Requisições

Para acessar endpoints protegidos, adicione o header `Authorization`:

```javascript
const token = obterToken();
const response = await fetch('/api/conteudos', {
  method: 'GET',
  headers: obterHeadersComAuth()  // Inclui o token automaticamente
});
```

Ou manualmente:
```bash
curl -X GET https://<seu-dominio>/api/conteudos \
  -H "Authorization: Bearer 1|abc123defg..."
```

## 📦 Testes Automatizados

Executar testes:
```bash
cd frontend
npm install
npm test
```

Isso executará testes de:
- `test/cadastro.test.js` - Validação e cadastro
- `test/auth.test.js` - Gerenciamento de token e login

## ⚙️ Observações

- O token é salvo no `localStorage` e persiste enquanto não fazer logout
- Cada dispositivo/navegador gera um token diferente
- O token expira após um período (configurável no Laravel)
- Ao fazer logout, o token é removido do `localStorage` E invalidado no servidor
