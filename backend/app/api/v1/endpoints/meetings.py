"""
Smart Meeting Assistant API
"""

from fastapi import APIRouter, UploadFile, File
from typing import Dict, Any, List

from app.services.meeting_service import MeetingAssistantService

router = APIRouter()
meeting_service = MeetingAssistantService()


@router.post("/analyze")
async def analyze_meeting(transcript: Dict[str, str]) -> Dict[str, Any]:
    """Analyze meeting transcript"""
    try:
        text = transcript.get("text", "")
        title = transcript.get("title", "Meeting")
        
        if not text:
            return {
                "success": False,
                "error": "No transcript provided"
            }
        
        summary = meeting_service.analyze_transcript(text, title)
        
        return {
            "success": True,
            "summary": {
                "title": summary.title,
                "duration": summary.duration,
                "participants": summary.participants,
                "decisions": [
                    {
                        "topic": d.topic,
                        "decision": d.decision,
                        "stakeholders": d.stakeholders
                    }
                    for d in summary.decisions
                ],
                "action_items": [
                    {
                        "task": a.task,
                        "assignee": a.assignee,
                        "deadline": a.deadline,
                        "priority": a.priority
                    }
                    for a in summary.action_items
                ],
                "key_points": summary.key_points,
                "summary_text": meeting_service.generate_summary_text(summary)
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/mock")
async def get_mock_meeting() -> Dict[str, Any]:
    """Get mock meeting analysis for demo"""
    return {
        "success": True,
        "summary": {
            "title": "Q4 产品规划会议",
            "duration": 45,
            "participants": ["张三", "李四", "王五"],
            "decisions": [
                {
                    "topic": "Q4 重点方向",
                    "decision": "Q4 重点做移动端优化，Web 端做基础性能优化",
                    "stakeholders": ["张三", "李四", "王五"]
                },
                {
                    "topic": "资源分配",
                    "decision": "移动端投入 70% 资源，Web 端 30%",
                    "stakeholders": ["张三"]
                }
            ],
            "action_items": [
                {
                    "task": "负责移动端方案设计，包括技术选型和架构设计",
                    "assignee": "李四",
                    "deadline": "下周三前",
                    "priority": "high"
                },
                {
                    "task": "跟进 Web 端性能优化，完成首页加载速度提升",
                    "assignee": "王五",
                    "deadline": "月底前",
                    "priority": "medium"
                },
                {
                    "task": "整理 Q4 OKR 并同步给团队",
                    "assignee": "张三",
                    "deadline": "本周五",
                    "priority": "high"
                }
            ],
            "key_points": [
                "移动端用户体验是当前最大痛点",
                "需要在 11 月底前完成 MVP 版本"
            ],
            "summary_text": "# Q4 产品规划会议\n\n**Duration:** 45 minutes\n**Participants:** 张三, 李四, 王五\n\n## Decisions\n1. **Q4 重点方向**: Q4 重点做移动端优化，Web 端做基础性能优化\n2. **资源分配**: 移动端投入 70% 资源，Web 端 30%\n\n## Action Items\n1. 🔴 **李四**: 负责移动端方案设计... (Due: 下周三前)\n2. 🟡 **王五**: 跟进 Web 端性能优化... (Due: 月底前)\n3. 🔴 **张三**: 整理 Q4 OKR... (Due: 本周五)"
        }
    }


@router.get("/history")
async def get_meeting_history() -> Dict[str, Any]:
    """Get meeting history"""
    return {
        "success": True,
        "meetings": [
            {
                "id": "1",
                "title": "Q4 产品规划会议",
                "date": "2024-03-15",
                "duration": 45,
                "participants": 3,
                "action_items_count": 3,
                "status": "completed"
            },
            {
                "id": "2",
                "title": "技术架构评审",
                "date": "2024-03-14",
                "duration": 60,
                "participants": 5,
                "action_items_count": 5,
                "status": "completed"
            },
            {
                "id": "3",
                "title": "周会同步",
                "date": "2024-03-13",
                "duration": 30,
                "participants": 8,
                "action_items_count": 2,
                "status": "completed"
            }
        ]
    }
