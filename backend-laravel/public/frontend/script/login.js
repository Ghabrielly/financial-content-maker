async function fazerLogin(email, senha) {
  const baseUrl = window.location.origin;
//Device Name 
 function getBrowserName() {
  const ua = navigator.userAgent;

  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";

  return "Browser";
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
      salvarToken(data.token);
      if (data.user) {
        try { salvarUsuario(data.user); } catch (e) { console.warn('não foi possível salvar usuário', e); }
      }
      console.log("Dados do login:", data);
      setTimeout(() => {
        window.location.href = "/frontend/analises.html";
      }, 500);
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
