// Requisição
async function cadastrarUsuario(nome, email, senha, confirmarSenha) {
  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return false;
  }

  const baseUrl = window.location.origin;

  try {
    const response = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name: nome,
        email: email,
        password: senha,
        password_confirmation: confirmarSenha
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Usuário cadastrado com sucesso!");
      console.log(data);
      setTimeout(() => {
        window.location.href = "/frontend/index.html";
      }, 500);
      return true;
    } else {
      alert("Erro: " + (data.message || "Verifique os dados e tente novamente."));
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

      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      const confirmar = document.getElementById("confirmar").value;

      await cadastrarUsuario(nome, email, senha, confirmar);
    });
  }
});
