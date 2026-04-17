"""
Email Priority Analysis API
AI-powered email importance scoring
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

from app.services.priority_service import PriorityService

router = APIRouter()
priority_service = PriorityService()


class EmailRequest(BaseModel):
    emails: List[Dict[str, Any]]


class PriorityResponse(BaseModel):
    success: bool
    analyses: List[Dict[str, Any]]
    summary: Dict[str, Any]


@router.post("/analyze", response_model=PriorityResponse)
async def analyze_emails(request: EmailRequest):
    """
    Analyze emails and return priority scores
    
    Returns AI-generated priority scores with detailed analysis
    """
    try:
        analyses = priority_service.batch_analyze(request.emails)
        distribution = priority_service.get_priority_distribution(analyses)
        
        # Calculate summary stats
        scores = [a["score"] for a in analyses]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Sort by priority (highest first)
        analyses.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "success": True,
            "analyses": analyses,
            "summary": {
                "total_analyzed": len(analyses),
                "average_score": round(avg_score, 1),
                "distribution": distribution,
                "urgent_count": distribution.get("urgent", 0),
                "important_count": distribution.get("important", 0)
            }
        }
    except Exception as e:
        return {
            "success": False,
            "analyses": [],
            "summary": {"error": str(e)}
        }


@router.post("/analyze-single")
async def analyze_single_email(email: Dict[str, Any]):
    """Analyze a single email"""
    try:
        analysis = priority_service.analyze_email(email)
        return {
            "success": True,
            "analysis": analysis
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/mock-analysis")
async def get_mock_analysis():
    """Get mock email priority data for demo"""
    mock_emails = [
        {
            "id": "1",
            "sender": "boss@company.com",
            "subject": "【紧急】Q1 财报需要今天提交",
            "preview": "请在今天下班前提交 Q1 财报，董事会明天需要看。",
            "received_at": "2024-03-15T09:30:00"
        },
        {
            "id": "2",
            "sender": "client@bigcorp.com",
            "subject": "项目进度更新会议",
            "preview": "能否安排明天下午 2 点的会议讨论项目进展？",
            "received_at": "2024-03-15T10:15:00"
        },
        {
            "id": "3",
            "sender": "hr@company.com",
            "subject": "本月团建活动通知",
            "preview": "本月团建定于下周五，请大家确认参加。",
            "received_at": "2024-03-15T11:00:00"
        },
        {
            "id": "4",
            "sender": "newsletter@tech.com",
            "subject": "本周科技资讯精选",
            "preview": "AI、云计算、区块链本周最新动态...",
            "received_at": "2024-03-15T08:00:00"
        },
        {
            "id": "5",
            "sender": "team-lead@company.com",
            "subject": "代码审查反馈",
            "preview": "你的 PR 有几处需要修改，请查看评论。",
            "received_at": "2024-03-15T14:20:00"
        }
    ]
    
    analyses = priority_service.batch_analyze(mock_emails)
    distribution = priority_service.get_priority_distribution(analyses)
    
    # Sort by score
    analyses.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "success": True,
        "emails": mock_emails,
        "analyses": analyses,
        "summary": {
            "total_analyzed": len(analyses),
            "average_score": round(sum(a["score"] for a in analyses) / len(analyses), 1),
            "distribution": distribution
        }
    }
