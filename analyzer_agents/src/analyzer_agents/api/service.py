import logging
import time
from typing import Any, Dict

def start_crew(topic: str):
    """
    Função que inicia a crew para processar o tópico. Executada em background.
    """

    try:
        from analyzer_agents.crew.crew import FinancialCrew

        crew_instance = FinancialCrew()
        inputs = {"topic": topic, "current_year": str(time.localtime().tm_year)}

        crew_obj = crew_instance.crew()
        output = crew_obj.kickoff(inputs=inputs)

        if hasattr(output, "raw"):
            final = getattr(output, "raw")
        else:
            result_val = getattr(output, "result", None)
            if result_val is not None:
                final = result_val
            else:
                final = str(output)

        return {"topic": topic, "result": final}
    except Exception as e:
        logging.exception("Falha ao executar crew para tópico: %s", topic)
        return {"topic": topic, "error": str(e)}
        
