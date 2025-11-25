// Carrega os scripts do frontend que estão copiados em backend-laravel/public/script
// Assim as funções globais (salvarToken, fazerLogin, etc.) ficam disponíveis no ambiente de testes (jsdom)

const path = require('path');
const fs = require('fs');

function tryRequireRel(parts) {
  const abs = path.resolve(process.cwd(), '..', ...parts);
  if (fs.existsSync(abs)) {
    try {
      require(abs);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Erro ao carregar', abs, e.message);
      return false;
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn('Arquivo não encontrado para testes:', abs);
    return false;
  }
}

tryRequireRel(['backend-laravel', 'public', 'script', 'auth.js']);
tryRequireRel(['backend-laravel', 'public', 'script', 'cadastro.js']);
tryRequireRel(['backend-laravel', 'public', 'script', 'login.js']);
