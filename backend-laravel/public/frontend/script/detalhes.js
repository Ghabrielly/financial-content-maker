document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("Nenhuma análise selecionada.");
        return;
    }

    try {
        const apiBase = window.location.origin; 
        const response = await fetch(`${apiBase}/api/conteudos/${id}`, {
            method: "GET",
            headers: obterHeadersComAuth()
        });

        if (!response.ok) throw new Error("Erro ao buscar dados.");

        const data = await response.json(); 
        preencherCampos(data);

    } catch (e) {
        console.error("ERRO DETALHES:", e);
        alert("Erro ao carregar detalhes da análise.");
    }
});

function preencherCampos(data) {
    document.getElementById("empresa").textContent = data.topico ?? "Não informado";
    document.getElementById("data").textContent = formatarData(data.updated_at);

    const statusEl = document.getElementById("status");
    let status = (data.status ?? "").toUpperCase();

    if (status === "APROVADO") {
        statusEl.textContent = "APROVADO";
        document.getElementById("motivo-box").style.display = "none";
    } else if (status === "REPROVADO") {
        statusEl.textContent = "REPROVADO";
        document.getElementById("motivo-box").style.display = "block";
        document.getElementById("motivo-reprovacao").textContent = data.motivo_reprovacao ?? "...";
    } else {
        statusEl.textContent = "PENDENTE";
        document.getElementById("motivo-box").style.display = "none";
    }

    aplicarCorStatus(statusEl, status);

    document.getElementById("topico").textContent = data.topico ?? "...";
    document.getElementById("conteudo").innerHTML = formatarConteudo(data.conteudo ?? "...");
}

function formatarData(dataISO) {
    if (!dataISO) return "Não disponível";
    return new Date(dataISO).toLocaleString("pt-BR");
}

function aplicarCorStatus(el, status) {
    el.classList.remove("status-aprovado", "status-reprovado", "status-pendente");

    switch ((status ?? "").toLowerCase()) {
        case "aprovado":
            el.classList.add("status-aprovado");
            break;
        case "reprovado":
            el.classList.add("status-reprovado");
            break;
        default:
            el.classList.add("status-pendente");
            break;
    }
}

function formatarConteudo(texto) {
    if (!texto) return "";

    let html = texto.replace(/^### (.*)$/gm, '<h4>$1</h4>')
                    .replace(/^## (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^\* (.*)$/gm, '<li>$1</li>')
               .replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
    html = html.replace(/\n/g, '<br>');

    return html;
}
