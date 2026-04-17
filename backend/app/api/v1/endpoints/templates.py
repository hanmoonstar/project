"""
Workflow Templates API
Predefined workflow templates
"""

from fastapi import APIRouter
from typing import Dict, Any, List

from app.services.template_service import TemplateService
from app.core.database import SessionLocal
from app.models.workflow import Workflow

router = APIRouter()
template_service = TemplateService()


@router.get("/")
async def get_templates(category: str = None) -> Dict[str, Any]:
    """Get all templates or filter by category"""
    if category:
        templates = template_service.get_templates_by_category(category)
    else:
        templates = template_service.get_all_templates()
    
    return {
        "success": True,
        "templates": templates,
        "categories": template_service.get_categories()
    }


@router.get("/popular")
async def get_popular_templates(limit: int = 4) -> Dict[str, Any]:
    """Get most popular templates"""
    templates = template_service.get_popular_templates(limit)
    return {
        "success": True,
        "templates": templates
    }


@router.post("/{template_id}/use")
async def use_template(template_id: str) -> Dict[str, Any]:
    """Create a workflow from a template"""
    template = template_service.get_template_by_id(template_id)
    
    if not template:
        return {
            "success": False,
            "error": "Template not found"
        }
    
    try:
        db = SessionLocal()
        try:
            workflow = Workflow(
                user_id=1,  # TODO: Get from auth
                name=template["name"],
                description=template["description"],
                trigger_type=template["trigger_type"],
                trigger_config=template["trigger_config"],
                actions=template["actions"],
                is_active=True
            )
            db.add(workflow)
            db.commit()
            db.refresh(workflow)
            
            return {
                "success": True,
                "message": f"Workflow '{template['name']}' created from template",
                "workflow": {
                    "id": workflow.id,
                    "name": workflow.name,
                    "description": workflow.description
                }
            }
        finally:
            db.close()
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
