"""
Workflow Conflict Detection Service
Detect conflicts and circular dependencies between workflows
"""

from typing import Dict, Any, List, Set, Tuple
from dataclasses import dataclass
from enum import Enum


class ConflictType(Enum):
    CIRCULAR_DEPENDENCY = "circular_dependency"
    RESOURCE_RACE = "resource_race"
    TIME_OVERLAP = "time_overlap"
    REDUNDANT_ACTION = "redundant_action"


@dataclass
class Conflict:
    type: ConflictType
    severity: str  # high, medium, low
    workflow_ids: List[str]
    description: str
    suggestion: str


class ConflictDetectionService:
    """Detect conflicts between workflows"""
    
    def analyze_workflows(self, workflows: List[Dict[str, Any]]) -> List[Conflict]:
        """Analyze all workflows for conflicts"""
        conflicts = []
        
        conflicts.extend(self._detect_circular_dependencies(workflows))
        conflicts.extend(self._detect_resource_races(workflows))
        conflicts.extend(self._detect_time_overlaps(workflows))
        conflicts.extend(self._detect_redundant_actions(workflows))
        
        return conflicts
    
    def _detect_circular_dependencies(self, workflows: List[Dict[str, Any]]) -> List[Conflict]:
        """Detect circular dependencies between workflows"""
        conflicts = []
        
        # Build dependency graph
        graph: Dict[str, Set[str]] = {}
        for wf in workflows:
            wf_id = str(wf.get("id", ""))
            graph[wf_id] = set()
            
            # Check if workflow triggers another workflow
            actions = wf.get("actions", [])
            for action in actions:
                if action.get("type") == "trigger_workflow":
                    target = action.get("config", {}).get("target_workflow")
                    if target:
                        graph[wf_id].add(target)
        
        # Detect cycles using DFS
        visited = set()
        rec_stack = set()
        
        def has_cycle(node: str, path: List[str]) -> Tuple[bool, List[str]]:
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in graph.get(node, set()):
                if neighbor not in visited:
                    found, cycle_path = has_cycle(neighbor, path.copy())
                    if found:
                        return True, cycle_path
                elif neighbor in rec_stack:
                    # Found cycle
                    cycle_start = path.index(neighbor)
                    return True, path[cycle_start:] + [neighbor]
            
            rec_stack.remove(node)
            return False, []
        
        for node in graph:
            if node not in visited:
                has_cyc, cycle_path = has_cycle(node, [])
                if has_cyc and len(cycle_path) > 0:
                    workflow_names = [f"Workflow-{wid}" for wid in cycle_path[:-1]]
                    conflicts.append(Conflict(
                        type=ConflictType.CIRCULAR_DEPENDENCY,
                        severity="high",
                        workflow_ids=cycle_path[:-1],
                        description=f"Circular dependency detected: {' → '.join(workflow_names)}",
                        suggestion="Break the cycle by removing one trigger action or merging workflows"
                    ))
        
        return conflicts
    
    def _detect_resource_races(self, workflows: List[Dict[str, Any]]) -> List[Conflict]:
        """Detect workflows that might race for the same resource"""
        conflicts = []
        
        # Group workflows by the resources they access
        resource_usage: Dict[str, List[str]] = {}
        
        for wf in workflows:
            wf_id = str(wf.get("id", ""))
            actions = wf.get("actions", [])
            
            for action in actions:
                action_type = action.get("type", "")
                config = action.get("config", {})
                
                # Identify resources
                if action_type == "send_digest":
                    resource = f"email:{config.get('destination', 'default')}"
                elif action_type == "create_task":
                    resource = f"task:{config.get('platform', 'default')}"
                elif action_type == "forward":
                    resource = f"forward:{config.get('target', 'default')}"
                else:
                    continue
                
                if resource not in resource_usage:
                    resource_usage[resource] = []
                resource_usage[resource].append(wf_id)
        
        # Find resources used by multiple workflows
        for resource, wf_ids in resource_usage.items():
            if len(wf_ids) > 1:
                conflicts.append(Conflict(
                    type=ConflictType.RESOURCE_RACE,
                    severity="medium",
                    workflow_ids=wf_ids,
                    description=f"Multiple workflows access the same resource: {resource}",
                    suggestion="Consider adding delays or conditions to prevent simultaneous access"
                ))
        
        return conflicts
    
    def _detect_time_overlaps(self, workflows: List[Dict[str, Any]]) -> List[Conflict]:
        """Detect scheduled workflows that might run at the same time"""
        conflicts = []
        
        scheduled_workflows = [
            wf for wf in workflows 
            if wf.get("trigger_type") == "schedule"
        ]
        
        # Group by similar schedule times
        time_groups: Dict[str, List[str]] = {}
        
        for wf in scheduled_workflows:
            wf_id = str(wf.get("id", ""))
            config = wf.get("trigger_config", {})
            cron = config.get("cron", "")
            
            # Simplified: group by hour
            if cron:
                hour = cron.split()[1] if len(cron.split()) > 1 else "*"
                if hour not in time_groups:
                    time_groups[hour] = []
                time_groups[hour].append(wf_id)
        
        # Find overlapping schedules
        for hour, wf_ids in time_groups.items():
            if len(wf_ids) > 2:  # More than 2 workflows at the same hour
                conflicts.append(Conflict(
                    type=ConflictType.TIME_OVERLAP,
                    severity="low",
                    workflow_ids=wf_ids,
                    description=f"{len(wf_ids)} workflows scheduled at the same time (hour: {hour})",
                    suggestion="Spread out schedules to distribute system load"
                ))
        
        return conflicts
    
    def _detect_redundant_actions(self, workflows: List[Dict[str, Any]]) -> List[Conflict]:
        """Detect redundant actions across workflows"""
        conflicts = []
        
        action_signatures: Dict[str, List[str]] = {}
        
        for wf in workflows:
            wf_id = str(wf.get("id", ""))
            actions = wf.get("actions", [])
            
            for action in actions:
                # Create signature
                sig = f"{action.get('type')}:{str(action.get('config', {}))}"
                
                if sig not in action_signatures:
                    action_signatures[sig] = []
                action_signatures[sig].append(wf_id)
        
        # Find identical actions in different workflows
        for sig, wf_ids in action_signatures.items():
            if len(wf_ids) > 1:
                action_type = sig.split(":")[0]
                conflicts.append(Conflict(
                    type=ConflictType.REDUNDANT_ACTION,
                    severity="low",
                    workflow_ids=wf_ids,
                    description=f"Identical '{action_type}' actions found in multiple workflows",
                    suggestion="Consider merging these actions into a shared workflow"
                ))
        
        return conflicts


# Example usage
if __name__ == "__main__":
    service = ConflictDetectionService()
    
    test_workflows = [
        {
            "id": "1",
            "name": "Morning Digest",
            "trigger_type": "schedule",
            "trigger_config": {"cron": "0 9 * * *"},
            "actions": [{"type": "send_digest", "config": {"destination": "email"}}]
        },
        {
            "id": "2",
            "name": "Evening Summary",
            "trigger_type": "schedule", 
            "trigger_config": {"cron": "0 9 * * *"},
            "actions": [{"type": "send_digest", "config": {"destination": "email"}}]
        }
    ]
    
    conflicts = service.analyze_workflows(test_workflows)
    for c in conflicts:
        print(f"[{c.severity.upper()}] {c.type.value}: {c.description}")
