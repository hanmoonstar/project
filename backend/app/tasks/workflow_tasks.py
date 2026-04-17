from datetime import datetime
from app.core.celery import celery_app
from app.core.database import SessionLocal
from app.models.workflow import Workflow, WorkflowExecution
from app.tasks.email_tasks import fetch_and_summarize_emails, send_digest_email


@celery_app.task(bind=True, max_retries=3)
def execute_workflow(self, workflow_id: int):
    """Execute a workflow by ID"""
    db = SessionLocal()
    try:
        # Get workflow
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow or not workflow.is_active:
            return {"status": "skipped", "reason": "Workflow not found or inactive"}
        
        # Create execution record
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            status="running",
            started_at=datetime.utcnow()
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)
        
        try:
            # Execute actions based on workflow type
            result = {"actions_completed": 0}
            
            for action in workflow.actions:
                action_type = action.get("type")
                
                if action_type == "fetch_emails":
                    # Trigger email fetch task
                    task = fetch_and_summarize_emails.delay(
                        workflow.user_id, 
                        action.get("email_account_id", 1)
                    )
                    result["email_task_id"] = task.id
                    
                elif action_type == "summarize":
                    # Summarization happens within fetch_and_summarize_emails
                    pass
                    
                elif action_type == "send_digest":
                    # Send digest (will be called after fetch completes)
                    pass
                
                result["actions_completed"] += 1
            
            # Update execution record
            execution.status = "completed"
            execution.completed_at = datetime.utcnow()
            execution.result = result
            db.commit()
            
            return {
                "status": "completed",
                "execution_id": execution.id,
                "result": result
            }
            
        except Exception as e:
            execution.status = "failed"
            execution.error_message = str(e)
            db.commit()
            raise self.retry(exc=e, countdown=300)
    
    finally:
        db.close()


@celery_app.task
def schedule_workflows():
    """Check and schedule due workflows"""
    db = SessionLocal()
    try:
        # Get all active workflows with schedule trigger
        workflows = db.query(Workflow).filter(
            Workflow.is_active == True,
            Workflow.trigger_type == "schedule"
        ).all()
        
        scheduled_count = 0
        for workflow in workflows:
            # Check if workflow should run now (simple cron check)
            # TODO: Implement proper cron parsing
            execute_workflow.delay(workflow.id)
            scheduled_count += 1
        
        return {"scheduled": scheduled_count}
    
    finally:
        db.close()


@celery_app.task
def morning_digest_workflow():
    """Predefined morning digest workflow"""
    """
    This task runs every morning at 9 AM:
    1. Fetch unread emails from last 24h
    2. Filter high/medium priority
    3. Generate AI summary
    4. Send digest email
    """
    # TODO: Get all users with morning digest enabled
    # For now, mock implementation
    
    result = fetch_and_summarize_emails.delay(user_id=1, email_account_id=1)
    
    return {
        "status": "scheduled",
        "task_id": result.id,
        "workflow": "morning_digest"
    }
