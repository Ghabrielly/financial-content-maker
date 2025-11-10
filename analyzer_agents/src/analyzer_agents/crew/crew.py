from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
from src.analyzer_agents.tools.yahoo_finance_tool import get_financial_data
from crewai_tools import SerperDevTool

@CrewBase
class FinancialCrew():
    """Equipe de Análise"""

    agents_config = '../config/agents.yaml'
    tasks_config = '../config/tasks.yaml'

    agents: List[BaseAgent]
    tasks: List[Task]

    @agent
    def julia(self) -> Agent:
        return Agent(
            config=self.agents_config['julia'], # type: ignore[index]
            tools=[get_financial_data], 
            max_rpm=5,
            verbose=True
        )

    @agent
    def pedro(self) -> Agent:
        return Agent(
            config=self.agents_config['pedro'], # type: ignore[index]
            tools=[SerperDevTool()], 
            max_rpm=5,
            verbose=True
        )

    @agent
    def key(self) -> Agent:
        return Agent(
            config=self.agents_config['key'], # type: ignore[index]
            max_rpm=5, 
            verbose=True
        )
    
    @task
    def task_julia_collect(self) -> Task:
        return Task(
            config=self.tasks_config['task_julia_collect'], # type: ignore[index]
            agent=self.julia()
        )

    @task
    def task_pedro_analyze(self) -> Task:
        return Task(
            config=self.tasks_config['task_pedro_analyze'], # type: ignore[index]
            agent=self.pedro(),
            context=[self.task_julia_collect()]
        )
        
    @task
    def task_key_draft(self) -> Task:
        return Task(
            config=self.tasks_config['task_key_draft'], # type: ignore[index]
            agent=self.key(),
            context=[self.task_julia_collect(), self.task_pedro_analyze()]
        )
    
    @crew
    def crew(self) -> Crew:
        """Cria a equipe de Análise Financeira"""
        return Crew(
            agents=self.agents, 
            tasks=self.tasks, 
            process=Process.sequential
        )
    