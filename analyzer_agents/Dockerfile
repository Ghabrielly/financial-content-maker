FROM python:3.10-slim

WORKDIR /app

RUN pip install uv

COPY pyproject.toml ./


RUN uv pip install . --system

COPY src/ /app/src

RUN uv pip install --system . --no-deps

EXPOSE 8000

CMD ["uvicorn", "src.analyzer_agents.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
