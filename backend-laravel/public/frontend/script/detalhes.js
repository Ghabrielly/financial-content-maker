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
        document.getElementById("motivo-reprovacao").textContent =
            data.motivo_reprovacao ?? "...";

    } else {
        statusEl.textContent = "PENDENTE";
        document.getElementById("motivo-box").style.display = "none";
    }

    aplicarCorStatus(statusEl, status);
    
    document.getElementById("conteudo").innerHTML =
        formatarConteudo(data.conteudo ?? "...");

    const boxStatus = document.getElementById("box-alterar-status");

    if (status !== "APROVADO" && status !== "REPROVADO") {
        boxStatus.style.display = "block";
    } else {
        boxStatus.style.display = "none";
    }
}


function formatarData(dataISO) {
    if (!dataISO) return "Não disponível";
    return new Date(dataISO).toLocaleString("pt-BR");
}


function aplicarCorStatus(el, status) {
    el.classList.remove("status-aprovado", "status-reprovado", "status-pendente");

    switch (status.toLowerCase()) {
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

    return texto
        .replace(/^### (.*)$/gm, "<h4>$1</h4>")
        .replace(/^## (.*)$/gm, "<h3>$1</h3>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/^\* (.*)$/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>)/gms, "<ul>$1</ul>")
        .replace(/\n/g, "<br>");
}


function exibirMotivo() {
    const select = document.getElementById("status-select");
    const motivoBox = document.getElementById("motivo-alteracao-box");

    motivoBox.style.display = select.value === "REPROVAR" ? "block" : "none";
}


async function alterarStatus() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("ID inválido.");
        return;
    }

    const select = document.getElementById("status-select");
    const valor = select.value;

    if (!valor) {
        alert("Selecione um status.");
        return;
    }

    let url = `${window.location.origin}/api/conteudos/${id}`;
    let options = {
        method: "POST",
        headers: {
            ...obterHeadersComAuth(),
            "Content-Type": "application/json"
        }
    };

    if (valor === "APROVAR") {
        url += "/aprovar";
        options.body = JSON.stringify({});
    }

    if (valor === "REPROVAR") {
        const motivo = document.getElementById("motivo-alteracao").value.trim();

        if (!motivo) {
            alert("Informe o motivo da reprovação.");
            return;
        }

        url += "/reprovar";
        options.body = JSON.stringify({ motivo_reprovacao: motivo });
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const erro = await response.json();
            console.error("ERRO ALTERAR STATUS:", erro);
            alert("Erro ao alterar status: " + (erro.error ?? "Erro desconhecido"));
            return;
        }

        window.location.reload();

    } catch (e) {
        console.error("ERRO FETCH:", e);
        alert("Erro inesperado ao alterar status.");
    }
}
