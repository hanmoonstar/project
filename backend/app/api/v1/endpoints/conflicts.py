"""
Workflow Conflict Detection API
"""

from fastapi import APIRouter
from typing import Dict, Any, List

from app.services.conflict_service import ConflictDetectionService
from app.core.database import SessionLocal
from app.models.workflow import Workflow

router = APIRouter()
conflict_service = ConflictDetectionService()


@router.get("/analyze")
async def analyze_conflicts() -> Dict[str, Any]:
    """Analyze all workflows for conflicts"""
    try:
        db = SessionLocal()
        try:
            workflows = db.query(Workflow).all()
            workflow_list = [
                {
                    "id": wf.id,
                    "name": wf.name,
                    "trigger_type": wf.trigger_type,
                    "trigger_config": wf.trigger_config,
                    "actions": wf.actions
                }
                for wf in workflows
            ]
            
            conflicts = conflict_service.analyze_workflows(workflow_list)
            
            return {
                "success": True,
                "conflicts": [
                    {
                        "type": c.type.value,
                        "severity": c.severity,
                        "workflow_ids": c.workflow_ids,
                        "description": c.description,
                        "suggestion": c.suggestion
                    }
                    for c in conflicts
                ],
                "total_workflows": len(workflow_list),
                "conflict_count": len(conflicts)
            }
        finally:
            db.close()
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/mock")
async def get_mock_conflicts() -> Dict[str, Any]:
    """Get mock conflict data for demo"""
    return {
        "success": True,
        "conflicts": [
            {
                "type": "time_overlap",
                "severity": "medium",
                "workflow_ids": ["1", "3"],
                "description": "2 workflows scheduled at the same time (hour: 9)",
                "suggestion": "Spread out schedules to distribute system load"
            },
            {
                "type": "resource_race",
                "severity": "low", 
                "workflow_ids": ["1", "2", "4"],
                "description": "Multiple workflows access the same resource: email:default",
                "suggestion": "Consider adding delays or conditions to prevent simultaneous access"
            },
            {
                "type": "redundant_action",
                "severity": "low",
                "workflow_ids": ["2", "5"],
                "description": "Identical 'send_digest' actions found in multiple workflows",
                "suggestion": "Consider merging these actions into a shared workflow"
            }
        ],
        "total_workflows": 5,
        "conflict_count": 3
    }
