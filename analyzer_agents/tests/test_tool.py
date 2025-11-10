from src.analyzer_agents.tools.yahoo_finance_tool import get_financial_data


def test_run_yfinance():
    print("Iniciando teste da ferramenta yfinance...")
    
   
    print("\n[Teste 1: Ticker Válido (AAPL)]")
    ticker_valido = "AAPL"
    data = get_financial_data.run(ticker=ticker_valido) # type: ignore
    print(f"Resultado para {ticker_valido}:")
    print(data)
    
    
    print("\n[Teste 2: Ticker Inválido (XYZ123ABC)]")
    ticker_invalido = "XYZ123ABC"
    data = get_financial_data.run(ticker=ticker_invalido)  # type: ignore
    print(f"Resultado para {ticker_invalido}:")
    print(data)
    
    
    print("\n[Teste 3: Ticker Vazio ('')]")
    ticker_vazio = ""
    data = get_financial_data.run(ticker_vazio)  # type: ignore
    print(f"Resultado para {ticker_vazio}:")
    print(data)

if __name__ == "__main__":
    test_run_yfinance()