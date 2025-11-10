from src.analyzer_agents.crew.crew import FinancialCrew
import pytest
from datetime import datetime
from dotenv import load_dotenv
import os


def test_financial_crew_execution():
    """Testa se a Crew é montada e executa com um tópico válido."""
    
    load_dotenv()
    
    
    test_topic = "Alphabet Inc. (GOOG)"
    
    inputs = {
        'topic': test_topic,
        'current_year': str(datetime.now().year)
    }

    print(f"\n--- INICIANDO TESTE PARA O TÓPICO: {test_topic} ---")
    
    try:
        
        crew_instance = FinancialCrew()
        
        
        crew_output = crew_instance.crew().kickoff(inputs=inputs)
        final_result = crew_output.raw
        
        print("\n--- RESULTADO FINAL DA KEY ---")
        print(final_result)
        
        # verifica se houve output
        assert final_result is not None
        # o resultado deve ser uma string longa, não um erro
        assert isinstance(final_result, str) 
        assert len(final_result) > 100 
        
        # verifica se o agente usou o tópico
        assert test_topic in final_result
        
        print("\n--- TESTE DE KICKOFF BEM SUCEDIDO ---")
        
    except Exception as e:
        
        pytest.fail(f"A execução da Crew falhou: {e}")