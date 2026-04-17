"""
Natural Language Processing API
Convert natural language to workflows
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from app.services.nlp_service import NLPService
from app.core.database import SessionLocal
from app.models.workflow import Workflow

router = APIRouter()
nlp_service = NLPService()


class NLPRequest(BaseModel):
    text: str


class NLPResponse(BaseModel):
    success: bool
    workflow_config: Dict[str, Any]
    message: str


@router.post("/parse", response_model=NLPResponse)
async def parse_natural_language(request: NLPRequest):
    """
    Parse natural language into workflow configuration
    
    Example:
    {
        "text": "每天早上9点，把未读邮件总结发给我"
    }
    """
    try:
        config = nlp_service.parse_workflow(request.text)
        
        return NLPResponse(
            success=True,
            workflow_config=config,
            message="Successfully parsed natural language command"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-workflow", response_model=Dict[str, Any])
async def create_workflow_from_text(request: NLPRequest):
    """
    Create a workflow directly from natural language
    
    This endpoint:
    1. Parses the natural language
    2. Creates the workflow in database
    3. Returns the created workflow
    """
    try:
        # Parse natural language
        config = nlp_service.parse_workflow(request.text)
        
        # Create workflow in database
        db = SessionLocal()
        try:
            workflow = Workflow(
                user_id=1,  # TODO: Get from auth
                name=config["name"],
                description=config["description"],
                trigger_type=config["trigger_type"],
                trigger_config=config.get("trigger_config", {}),
                actions=config.get("actions", []),
                is_active=True
            )
            db.add(workflow)
            db.commit()
            db.refresh(workflow)
            
            return {
                "success": True,
                "message": f"Workflow '{workflow.name}' created successfully",
                "workflow": {
                    "id": workflow.id,
                    "name": workflow.name,
                    "description": workflow.description,
                    "trigger_type": workflow.trigger_type,
                    "actions": workflow.actions,
                    "is_active": workflow.is_active
                },
                "parsed_config": config
            }
        finally:
            db.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preview")
async def preview_workflow(request: NLPRequest):
    """
    Preview what a workflow would look like without creating it
    """
    try:
        config = nlp_service.parse_workflow(request.text)
        
        # Generate human-readable explanation
        explanation = generate_explanation(config)
        
        return {
            "success": True,
            "config": config,
            "explanation": explanation,
            "can_create": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def generate_explanation(config: Dict[str, Any]) -> str:
    """Generate human-readable explanation of workflow"""
    parts = []
    
    # Trigger explanation
    trigger_type = config.get("trigger_type", "schedule")
    trigger_config = config.get("trigger_config", {})
    
    if trigger_type == "schedule":
        frequency = trigger_config.get("frequency", "daily")
        cron = trigger_config.get("cron", "")
        parts.append(f"⏰ 触发条件: {frequency} 定时执行 ({cron})")
    elif trigger_type == "email_received":
        conditions = trigger_config.get("conditions", [])
        if conditions:
            parts.append(f"📧 触发条件: 收到符合条件的邮件")
        else:
            parts.append(f"📧 触发条件: 收到新邮件")
    
    # Actions explanation
    actions = config.get("actions", [])
    if actions:
        parts.append(f"⚡ 执行动作 ({len(actions)} 个):")
        for i, action in enumerate(actions, 1):
            action_type = action.get("type", "")
            if action_type == "fetch_emails":
                parts.append(f"  {i}. 获取邮件")
            elif action_type == "summarize":
                parts.append(f"  {i}. 生成智能摘要")
            elif action_type == "send_digest":
                parts.append(f"  {i}. 发送摘要报告")
            elif action_type == "mark_priority":
                parts.append(f"  {i}. 标记优先级")
            elif action_type == "forward":
                parts.append(f"  {i}. 转发邮件")
            elif action_type == "create_task":
                parts.append(f"  {i}. 创建待办任务")
            else:
                parts.append(f"  {i}. {action_type}")
    
    return "\n".join(parts)
