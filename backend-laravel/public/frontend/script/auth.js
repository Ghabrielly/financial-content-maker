// Gerenciar tokens de autenticação usando localStorage

/**
 * Salvar token no localStorage
 */
function salvarToken(token) {
  localStorage.setItem("authToken", token);
  console.log("Token salvo com sucesso");
}

/**
 * Obter token do localStorage
 */
function obterToken() {
  return localStorage.getItem("authToken");
}

/**
 * Remover token do localStorage (logout)
 */
function removerToken() {
  localStorage.removeItem("authToken");
  console.log("Token removido");
}

/**
 * Verificar se o usuário está autenticado
 */
function estaAutenticado() {
  return obterToken() !== null;
}

/**
 * Obter headers com autenticação
 */
function obterHeadersComAuth() {
  const token = obterToken();
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
}

/**
 * Fazer logout
 */
async function fazerLogout() {
  const baseUrl = window.location.origin;
  const token = obterToken();

  if (!token) {
    console.warn("Não há token para fazer logout");
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/api/logout`, {
      method: "POST",
      headers: obterHeadersComAuth()
    });

    if (response.ok) {
      removerToken();
      console.log("Logout realizado com sucesso");
      window.location.href = "/index.html";
    } else {
      console.error("Erro ao fazer logout");
    }
  } catch (error) {
    console.error("Erro na requisição de logout:", error);
    // Mesmo com erro, remove o token localmente
    removerToken();
  }
}
 
/**
 * Salvar informações do usuário no localStorage
 */
function salvarUsuario(user) {
  try {
    localStorage.setItem("authUser", JSON.stringify(user));
    console.log("Usuário salvo no localStorage");
  } catch (e) {
    console.error("Erro ao salvar usuário:", e);
  }
}

/**
 * Obter usuário salvo
 */
function obterUsuario() {
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Erro ao obter usuário:", e);
    return null;
  }
}

/**
 * Remover usuário do localStorage
 */
function removerUsuario() {
  localStorage.removeItem("authUser");
}
