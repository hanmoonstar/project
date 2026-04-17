"""
AI Reply Generation API
Generate intelligent email replies
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List

from app.services.reply_service import ReplyService

router = APIRouter()
reply_service = ReplyService()


class ReplyRequest(BaseModel):
    email: Dict[str, Any]
    tone: str = "professional"


class ReplyResponse(BaseModel):
    success: bool
    reply: Dict[str, Any]


@router.post("/generate", response_model=ReplyResponse)
async def generate_reply(request: ReplyRequest):
    """Generate a reply for an email"""
    try:
        reply = reply_service.generate_reply(request.email, request.tone)
        return {
            "success": True,
            "reply": reply
        }
    except Exception as e:
        return {
            "success": False,
            "reply": {"error": str(e)}
        }


@router.post("/generate-options")
async def generate_reply_options(email: Dict[str, Any]):
    """Generate multiple reply options with different tones"""
    try:
        replies = reply_service.generate_reply_options(email)
        return {
            "success": True,
            "replies": replies
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/mock-reply")
async def get_mock_reply():
    """Get mock reply data for demo"""
    mock_email = {
        "id": "1",
        "sender": "boss@company.com",
        "subject": "Q1 Report Deadline",
        "body": "Hi, can you please send me the Q1 report by tomorrow? We need it for the board meeting on Friday. Also, please include the revenue breakdown by region. Thanks!"
    }
    
    replies = reply_service.generate_reply_options(mock_email)
    
    return {
        "success": True,
        "email": mock_email,
        "replies": replies
    }
