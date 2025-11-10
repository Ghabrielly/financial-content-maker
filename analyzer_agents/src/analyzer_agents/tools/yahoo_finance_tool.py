import yfinance as yf
from crewai.tools import tool


@tool("Yahoo Finance Tool")
def get_financial_data(ticker: str) -> dict:
    """
    Busca dados financeiros para um ticker específico usando o Yahoo Finance.
    """
    try:
        stock = yf.Ticker(ticker)
        info =  stock.info

        if not info or info.get('regularMarketPrice') is None:
             return {
                 "error": f"Não foram encontrados dados para o ticker '{ticker}'. Pode ser um ticker inválido ou removido."
             }

        return {
                "companyName": info.get("longName"),
                "currentPrice": info.get("currentPrice"),
                "peRatio": info.get("trailingPE"),
                "marketCap": info.get("marketCap"),
                "summary": info.get("longBusinessSummary")
        }
    except Exception as e:
        return {
            "error": f"Ocorreu um erro ao buscar dados para o ticker '{ticker}'. Erro{e}"
        }