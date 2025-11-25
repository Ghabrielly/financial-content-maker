// Fazer login e salvar token

async function fazerLogin(email, senha) {
  const baseUrl = window.location.origin;
  // Detectar nome do navegador/cliente para device_name
  function getBrowserName() {
    try {
      if (typeof navigator === 'undefined') return 'unknown';
      const ua = navigator.userAgent || '';
      if (/Firefox\//.test(ua)) return 'Firefox';
      if (/Edg\//.test(ua) || /Edge\//.test(ua)) return 'Edge';
      if (/OPR\//.test(ua) || /Opera/.test(ua)) return 'Opera';
      if (/Chrome\//.test(ua) && /Safari\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua)) return 'Chrome';
      if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
      if (navigator.userAgentData && navigator.userAgentData.brands) {
        return navigator.userAgentData.brands.map(b => b.brand).join(', ');
      }
      return 'browser';
    } catch (e) {
      return 'unknown';
    }
  }

  try {
    const deviceName = getBrowserName();

    const response = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: senha,
        device_name: deviceName
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Salvar o token
      salvarToken(data.token);
      // Salvar informações do usuário para uso na UI
      if (data.user) {
        try { salvarUsuario(data.user); } catch (e) { console.warn('não foi possível salvar usuário', e); }
      }
      alert("Login realizado com sucesso!");
      console.log("Dados do login:", data);
      // Redirecionar para a página de análises após 1.5 segundos
      setTimeout(() => {
        window.location.href = "/analises.html";
      }, 1500);
      return true;
    } else {
      alert("Erro: " + (data.message || "Credenciais inválidas."));
      console.log(data);
      return false;
    }

  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Não foi possível conectar ao servidor.");
    return false;
  }
}

// Inicializar listeners quando o DOM carregar
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;

      if (!email || !senha) {
        alert("Por favor, preencha todos os campos");
        return;
      }

      await fazerLogin(email, senha);
    });
  }
});
