"""
AI Workflow Optimizer Service
Analyze workflow efficiency and provide optimization suggestions
"""

from typing import Dict, Any, List
from dataclasses import dataclass
from enum import Enum


class OptimizationType(Enum):
    PERFORMANCE = "performance"
    COST = "cost"
    RELIABILITY = "reliability"
    SIMPLICITY = "simplicity"


@dataclass
class OptimizationSuggestion:
    type: OptimizationType
    priority: str  # high, medium, low
    title: str
    description: str
    current_value: str
    suggested_value: str
    impact: str
    estimated_improvement: str


class WorkflowOptimizerService:
    """AI-powered workflow optimization"""
    
    def analyze_workflow(self, workflow: Dict[str, Any], execution_history: List[Dict] = None) -> List[OptimizationSuggestion]:
        """Analyze a single workflow for optimization opportunities"""
        suggestions = []
        
        suggestions.extend(self._analyze_performance(workflow, execution_history))
        suggestions.extend(self._analyze_cost(workflow))
        suggestions.extend(self._analyze_reliability(workflow))
        suggestions.extend(self._analyze_simplicity(workflow))
        
        return sorted(suggestions, key=lambda x: {'high': 0, 'medium': 1, 'low': 2}.get(x.priority, 3))
    
    def _analyze_performance(self, workflow: Dict[str, Any], history: List[Dict] = None) -> List[OptimizationSuggestion]:
        """Analyze performance bottlenecks"""
        suggestions = []
        actions = workflow.get("actions", [])
        
        # Check for sequential API calls that could be parallelized
        api_actions = [a for a in actions if a.get("type") in ["fetch_emails", "summarize", "send_digest"]]
        if len(api_actions) >= 3:
            suggestions.append(OptimizationSuggestion(
                type=OptimizationType.PERFORMANCE,
                priority="high",
                title="Parallelize API Calls",
                description="Multiple API calls detected that could run in parallel",
                current_value=f"{len(api_actions)} sequential calls",
                suggested_value="Batch processing with Promise.all()",
                impact="Reduces execution time by 40-60%",
                estimated_improvement="-45% latency"
            ))
        
        # Check for redundant data fetching
        fetch_actions = [a for a in actions if a.get("type") == "fetch_emails"]
        if len(fetch_actions) > 1:
            suggestions.append(OptimizationSuggestion(
                type=OptimizationType.PERFORMANCE,
                priority="medium",
                title="Merge Data Fetching",
                description="Multiple email fetch operations detected",
                current_value=f"{len(fetch_actions)} separate fetches",
                suggested_value="Single fetch with combined filters",
                impact="Reduces API calls and improves response time",
                estimated_improvement="-30% API calls"
            ))
        
        return suggestions
    
    def _analyze_cost(self, workflow: Dict[str, Any]) -> List[OptimizationSuggestion]:
        """Analyze cost optimization opportunities"""
        suggestions = []
        actions = workflow.get("actions", [])
        
        # Check for expensive AI model usage
        ai_actions = [a for a in actions if a.get("type") == "summarize"]
        for action in ai_actions:
            config = action.get("config", {})
            model = config.get("model", "gpt-3.5-turbo")
            if model == "gpt-4":
                suggestions.append(OptimizationSuggestion(
                    type=OptimizationType.COST,
                    priority="medium",
                    title="Optimize AI Model Selection",
                    description="GPT-4 is used for simple summarization tasks",
                    current_value="gpt-4 ($0.03/1K tokens)",
                    suggested_value="gpt-3.5-turbo ($0.002/1K tokens)",
                    impact="Reduces AI costs by 90% with minimal quality loss",
                    estimated_improvement="-93% cost"
                ))
        
        # Check for frequent scheduled runs
        trigger_config = workflow.get("trigger_config", {})
        if workflow.get("trigger_type") == "schedule":
            cron = trigger_config.get("cron", "")
            if cron.startswith("*/5") or "* * * *" in cron:
                suggestions.append(OptimizationSuggestion(
                    type=OptimizationType.COST,
                    priority="low",
                    title="Reduce Execution Frequency",
                    description="Workflow runs very frequently",
                    current_value="Every 5 minutes",
                    suggested_value="Every 30 minutes or event-driven",
                    impact="Reduces compute costs and API rate limits",
                    estimated_improvement="-83% execution cost"
                ))
        
        return suggestions
    
    def _analyze_reliability(self, workflow: Dict[str, Any]) -> List[OptimizationSuggestion]:
        """Analyze reliability improvements"""
        suggestions = []
        actions = workflow.get("actions", [])
        
        # Check for missing error handling
        has_error_handling = any(
            a.get("type") == "error_handler" or 
            a.get("config", {}).get("retry_on_failure") 
            for a in actions
        )
        
        if not has_error_handling and len(actions) > 0:
            suggestions.append(OptimizationSuggestion(
                type=OptimizationType.RELIABILITY,
                priority="high",
                title="Add Error Handling",
                description="Workflow lacks error recovery mechanisms",
                current_value="No retry logic",
                suggested_value="Add exponential backoff retry",
                impact="Prevents workflow failures from transient errors",
                estimated_improvement="+95% success rate"
            ))
        
        # Check for timeout configuration
        has_timeout = any(
            a.get("config", {}).get("timeout_ms") 
            for a in actions
        )
        
        if not has_timeout:
            suggestions.append(OptimizationSuggestion(
                type=OptimizationType.RELIABILITY,
                priority="medium",
                title="Configure Timeouts",
                description="Actions may hang indefinitely on slow responses",
                current_value="No timeout set",
                suggested_value="30s timeout with fallback",
                impact="Prevents stuck workflows and resource exhaustion",
                estimated_improvement="+80% reliability"
            ))
        
        return suggestions
    
    def _analyze_simplicity(self, workflow: Dict[str, Any]) -> List[OptimizationSuggestion]:
        """Analyze workflow simplification opportunities"""
        suggestions = []
        actions = workflow.get("actions", [])
        
        # Check for overly complex workflows
        if len(actions) > 8:
            suggestions.append(OptimizationSuggestion(
                type=OptimizationType.SIMPLICITY,
                priority="medium",
                title="Split Complex Workflow",
                description="Workflow has too many actions",
                current_value=f"{len(actions)} actions",
                suggested_value="Split into 2-3 smaller workflows",
                impact="Easier to debug, test, and maintain",
                estimated_improvement="+50% maintainability"
            ))
        
        # Check for duplicate action patterns
        action_types = [a.get("type") for a in actions]
        duplicates = set([x for x in action_types if action_types.count(x) > 1])
        
        if len(duplicates) > 0:
            suggestions.append(OptimizationSuggestion(
                type=OptimizationType.SIMPLICITY,
                priority="low",
                title="Consolidate Duplicate Actions",
                description=f"Repeated action types: {', '.join(duplicates)}",
                current_value="Scattered similar actions",
                suggested_value="Group related actions together",
                impact="Cleaner workflow structure",
                estimated_improvement="+30% readability"
            ))
        
        return suggestions


# Example usage
if __name__ == "__main__":
    service = WorkflowOptimizerService()
    
    test_workflow = {
        "id": "1",
        "name": "Morning Digest",
        "trigger_type": "schedule",
        "trigger_config": {"cron": "0 9 * * *"},
        "actions": [
            {"type": "fetch_emails", "config": {"filter": "unread"}},
            {"type": "fetch_emails", "config": {"filter": "important"}},
            {"type": "summarize", "config": {"model": "gpt-4"}},
            {"type": "send_digest", "config": {"destination": "email"}}
        ]
    }
    
    suggestions = service.analyze_workflow(test_workflow)
    for s in suggestions:
        print(f"[{s.priority.upper()}] {s.title}: {s.estimated_improvement}")
