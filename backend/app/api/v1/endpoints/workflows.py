from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.schemas.workflow import WorkflowCreate, WorkflowResponse, WorkflowExecution
from app.models.workflow import Workflow as WorkflowModel, WorkflowExecution as ExecutionModel
from app.services.email_service import EmailService
from app.services.ai_service import AIService

router = APIRouter()


@router.get("/", response_model=List[WorkflowResponse])
async def list_workflows(db: Session = Depends(get_db)):
    """List all user workflows"""
    workflows = db.query(WorkflowModel).all()
    return workflows


@router.post("/", response_model=WorkflowResponse)
async def create_workflow(workflow: WorkflowCreate, db: Session = Depends(get_db)):
    """Create a new workflow"""
    db_workflow = WorkflowModel(
        user_id=1,  # TODO: Get from auth
        name=workflow.name,
        description=workflow.description,
        trigger_type=workflow.trigger_type,
        trigger_config=workflow.trigger_config,
        actions=workflow.actions,
        is_active=True
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow


@router.post("/{workflow_id}/execute")
async def trigger_workflow(workflow_id: int, db: Session = Depends(get_db)):
    """Manually trigger a workflow execution"""
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Create execution record
    execution = ExecutionModel(
        workflow_id=workflow_id,
        status="running",
        started_at=datetime.utcnow()
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)
    
    try:
        # Execute workflow actions directly (synchronous for testing)
        result = {"actions_completed": 0, "summary": ""}
        
        for action in workflow.actions:
            action_type = action.get("type")
            
            if action_type == "fetch_emails":
                # Mock email fetch
                emails = [
                    {"subject": "Q1 Report Due", "sender": "boss@company.com", "preview": "Please submit..."},
                    {"subject": "Project Update", "sender": "client@example.com", "preview": "Can we schedule..."},
                ]
                result["emails_fetched"] = len(emails)
                
                # Generate summary
                ai_service = AIService()
                result["summary"] = ai_service.summarize_emails(emails)
                
            result["actions_completed"] += 1
        
        # Update execution record
        execution.status = "completed"
        execution.completed_at = datetime.utcnow()
        execution.result = result
        db.commit()
        
        return {
            "execution_id": execution.id,
            "workflow_id": workflow_id,
            "status": "completed",
            "result": result
        }
        
    except Exception as e:
        execution.status = "failed"
        execution.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{workflow_id}/history")
async def get_workflow_history(workflow_id: int, db: Session = Depends(get_db)):
    """Get execution history for a workflow"""
    executions = db.query(ExecutionModel).filter(
        ExecutionModel.workflow_id == workflow_id
    ).order_by(ExecutionModel.started_at.desc()).all()
    
    return executions
