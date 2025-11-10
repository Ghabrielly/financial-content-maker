from fastapi import FastAPI, BackgroundTasks, HTTPException, status
from .schemas import TopicRequest
from .service import start_crew

app = FastAPI(
    title="Analyzer Agents API",
    version="0.1.0",
    description="Serviço de Agentes: recebe um tópico, analisa e retorna um conteúdo sobre o ativo/empresa recomendando (ou não). "
                "Documentação Swagger disponível em /docs."
)


@app.get("/helthz", tags=["Health"], summary="Health check")
def helthz():
    """
    Checa se a api está rodando. 
    """
    return {
        "status": "OK.",
        "message": "API Rodando."
    }


@app.post("/analyze", tags=["Analyze"], summary="Analyze the topic")
def analisarTopico(payload: TopicRequest, background_tasks: BackgroundTasks):
    """
    Recebe um tópico para análise, executa a crew e retorna o resultado.
    - retorna 400 se topic for nulo/vazio
    - **topic**: O tópico/ativo a ser analisado.
    """

    topic = (payload.topic or "").strip()
    if not topic:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O tópico é obrigatório e não pode estar em branco")

    result = start_crew(topic)

    if result.get("error"):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result["error"])

    return {
        "status": "success",
        "topic": topic,
        "result": result.get("result")
    }