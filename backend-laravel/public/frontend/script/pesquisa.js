const baseUrl = window.location.origin;
let conteudoAtual = null;

async function buscarConteudoCriado(topico, tentativas = 0, maxTentativas = 20) {
  try {
    const response = await fetch(`${baseUrl}/api/conteudos?topico=${encodeURIComponent(topico)}`, {
      method: "GET",
      headers: obterHeadersComAuth()
    });

    const data = await response.json();
    const conteudos = data.data || [];
    const encontrado = conteudos.find(c => c.topico.toLowerCase() === topico.toLowerCase());

    if (encontrado) {
      conteudoAtual = encontrado;
      mostrarConteudo(conteudoAtual);
      return;
    }

    if (tentativas < maxTentativas) {
      setTimeout(() => buscarConteudoCriado(topico, tentativas + 1), 2000);
    }

  } catch (error) {
    console.error("Erro ao buscar conteúdo:", error);
    alert("Erro ao buscar conteúdo. Veja console para detalhes.");
  }
}

async function gerarAnalise(topico) {
  const box = document.getElementById("analysis-box");
  box.innerHTML = "Gerando análise...";

  try {
    const response = await fetch(`${baseUrl}/api/conteudos/gerar`, {
      method: "POST",
      headers: obterHeadersComAuth(),
      body: JSON.stringify({ topico })
    });

    if (!response.ok) {
      const txt = await response.text();
      box.innerHTML = `Erro:<br><pre>${txt}</pre>`;
      return;
    }

    document.getElementById("company-input").value = "";
    buscarConteudoCriado(topico);

  } catch (e) {
    console.error("Erro ao gerar análise:", e);
    box.innerHTML = "Erro ao gerar análise";
    alert("Erro ao gerar análise. Veja console para detalhes.");
  }
}

function mostrarConteudo(conteudo) {
  const box = document.getElementById("analysis-box");

  const formatado = (conteudo.conteudo || "")
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\/n/g, '<br>');

  box.innerHTML = `
    <div class="analysis-content">
      <h4>${conteudo.topico}</h4>
      <p>${formatado}</p>
    </div>
  `;
}

const companyInput = document.getElementById("company-input");
const sendBtn = document.getElementById("send-btn");
const motivoContainer = document.getElementById("motivo-reprovacao-container");
const motivoInput = document.getElementById("motivo-input");

companyInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const empresa = companyInput.value.trim();
    if (empresa) gerarAnalise(empresa);
    companyInput.value = "";
  }
});

sendBtn.addEventListener("click", () => {
  const empresa = companyInput.value.trim();
  if (empresa) gerarAnalise(empresa);
  companyInput.value = "";
});

async function atualizarStatus(status, motivo = null) {
  if (!conteudoAtual) {
    alert("Nenhuma análise carregada!");
    return;
  }

  let endpoint = '';
  let method = 'PUT';
  let body = null;

  const agora = new Date().toISOString();

  if (status === "APROVADO") {
    endpoint = `/aprovar`;
    method = 'POST';
  } else if (status === "REPROVADO") {
    endpoint = `/reprovar`;
    method = 'POST';
    body = { motivo_reprovacao: motivo };
  } else if (status === "PENDENTE") {
    endpoint = '';
    method = 'PUT';
    body = { status: status };
  }

  if (!body) body = {};
  body.updated_at = agora;

  try {
    const response = await fetch(`${baseUrl}/api/conteudos/${conteudoAtual.id}${endpoint}`, {
      method,
      headers: obterHeadersComAuth(),
      body: body ? JSON.stringify(body) : null
    });

    if (response.ok) {
      window.location.href = `detalhes.html?id=${conteudoAtual.id}`;
    } else {
      const txt = await response.text();
      alert(`Erro ao atualizar status:\n${txt}`);
      console.error("Erro ao atualizar status:", txt);
    }
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    alert("Erro ao atualizar status. Veja console para detalhes.");
  }
}

document.querySelector(".status-aprovado").addEventListener("click", () => {
  atualizarStatus("APROVADO");
});

document.querySelector(".status-pendente").addEventListener("click", () => {
  atualizarStatus("PENDENTE");
});

document.querySelector(".status-reprovado").addEventListener("click", () => {
  if (!conteudoAtual) {
    alert("Nenhuma análise carregada!");
    return;
  }
  motivoContainer.classList.remove("d-none");
});

document.getElementById("enviar-motivo").addEventListener("click", () => {
  const motivo = motivoInput.value.trim();
  if (!motivo) {
    alert("Digite o motivo!");
    return;
  }
  atualizarStatus("REPROVADO", motivo);
  motivoContainer.classList.add("d-none");
  motivoInput.value = "";
});
