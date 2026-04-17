"""
AI Email Priority Scoring Service
Intelligent email importance analysis using AI
"""

import json
from typing import Dict, List, Any
from datetime import datetime
from app.core.config import settings


class PriorityService:
    """AI-powered email priority scoring"""
    
    def __init__(self):
        self.huggingface_api_key = settings.HUGGINGFACE_API_KEY
    
    def analyze_email(self, email: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze email and return priority score with reasoning
        
        Returns:
            {
                "score": 0-100,
                "category": "urgent|important|normal|low",
                "reasoning": "为什么是这个分数",
                "factors": {
                    "sender_importance": 0-100,
                    "content_urgency": 0-100,
                    "action_required": 0-100,
                    "time_sensitivity": 0-100
                },
                "suggested_action": "建议操作",
                "estimated_response_time": "预计回复时间"
            }
        """
        try:
            return self._analyze_with_huggingface(email)
        except Exception as e:
            print(f"Hugging Face analysis failed: {e}")
            return self._analyze_with_rules(email)
    
    def _analyze_with_huggingface(self, email: Dict[str, Any]) -> Dict[str, Any]:
        """Use Hugging Face for intelligent priority analysis"""
        import requests
        
        prompt = f"""
Analyze this email and provide a detailed priority assessment.

Email:
- From: {email.get('sender', 'Unknown')}
- Subject: {email.get('subject', 'No Subject')}
- Content: {email.get('body', email.get('preview', ''))[:500]}
- Time: {email.get('received_at', 'Unknown')}

Provide a JSON response with:
{{
    "score": 0-100 integer (overall priority score),
    "category": "urgent" (>80) | "important" (60-80) | "normal" (30-60) | "low" (<30),
    "reasoning": "Brief explanation in Chinese",
    "factors": {{
        "sender_importance": 0-100,
        "content_urgency": 0-100,
        "action_required": 0-100,
        "time_sensitivity": 0-100
    }},
    "suggested_action": "reply|read|delegate|ignore",
    "estimated_response_time": "immediate|today|this_week|none"
}}

Consider:
- Is it from boss/important client? (sender_importance)
- Does it contain urgent keywords? (content_urgency)
- Does it require action? (action_required)
- Is there a deadline? (time_sensitivity)
"""
        
        # Use Hugging Face Inference API with a free model
        headers = {}
        if self.huggingface_api_key:
            headers["Authorization"] = f"Bearer {self.huggingface_api_key}"
        
        response = requests.post(
            "https://api-inference.huggingface.co/models/google/flan-t5-large",
            headers=headers,
            json={"inputs": prompt, "parameters": {"max_length": 800, "temperature": 0.3}}
        )
        
        if response.status_code == 200:
            result = response.json()[0]['generated_text']
            # Clean up markdown
            import re
            result = re.sub(r'```json\s*', '', result)
            result = re.sub(r'```\s*', '', result)
            
            analysis = json.loads(result)
            analysis["email_id"] = email.get("id")
            analysis["analyzed_at"] = datetime.utcnow().isoformat()
            return analysis
        else:
            raise Exception(f"Hugging Face API error: {response.status_code}")
    
    def _analyze_with_rules(self, email: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based priority analysis as fallback"""
        sender = email.get("sender", "").lower()
        subject = email.get("subject", "").lower()
        content = email.get("body", email.get("preview", "")).lower()
        
        # Initialize factors
        factors = {
            "sender_importance": 50,
            "content_urgency": 50,
            "action_required": 50,
            "time_sensitivity": 50
        }
        
        # Sender importance scoring
        if any(kw in sender for kw in ["boss", "manager", "ceo", "director", "领导", "经理"]):
            factors["sender_importance"] = 95
        elif any(kw in sender for kw in ["client", "customer", "客户"]):
            factors["sender_importance"] = 85
        elif any(kw in sender for kw in ["team", "colleague", "同事"]):
            factors["sender_importance"] = 70
        elif any(kw in sender for kw in ["noreply", "notification", "通知"]):
            factors["sender_importance"] = 30
        
        # Content urgency scoring
        urgent_keywords = ["urgent", "asap", "immediately", "紧急", "尽快", "立即", "马上", "deadline", "截止", "期限"]
        important_keywords = ["important", "attention", "action required", "重要", "注意", "需要处理", "请回复"]
        
        urgent_count = sum(1 for kw in urgent_keywords if kw in subject or kw in content)
        important_count = sum(1 for kw in important_keywords if kw in subject or kw in content)
        
        factors["content_urgency"] = min(50 + urgent_count * 20 + important_count * 10, 100)
        
        # Action required scoring
        action_keywords = ["please reply", "need your input", "review", "approve", "confirm", "请回复", "请确认", "请审批", "请查看"]
        action_count = sum(1 for kw in action_keywords if kw in content)
        factors["action_required"] = min(50 + action_count * 15, 100)
        
        # Time sensitivity scoring
        time_keywords = ["today", "tomorrow", "this week", "by", "before", "今天", "明天", "本周", "之前", "以内"]
        time_count = sum(1 for kw in time_keywords if kw in content)
        factors["time_sensitivity"] = min(50 + time_count * 15, 100)
        
        # Calculate overall score
        score = int(sum(factors.values()) / 4)
        
        # Determine category
        if score >= 80:
            category = "urgent"
        elif score >= 60:
            category = "important"
        elif score >= 30:
            category = "normal"
        else:
            category = "low"
        
        # Generate reasoning
        reasoning_parts = []
        if factors["sender_importance"] >= 80:
            reasoning_parts.append("发件人重要")
        if factors["content_urgency"] >= 70:
            reasoning_parts.append("内容紧急")
        if factors["action_required"] >= 70:
            reasoning_parts.append("需要立即处理")
        if factors["time_sensitivity"] >= 70:
            reasoning_parts.append("时间敏感")
        
        reasoning = "、".join(reasoning_parts) if reasoning_parts else "常规邮件"
        
        # Suggested action
        if score >= 80:
            suggested_action = "reply"
            estimated_time = "immediate"
        elif score >= 60:
            suggested_action = "read"
            estimated_time = "today"
        elif score >= 30:
            suggested_action = "read"
            estimated_time = "this_week"
        else:
            suggested_action = "ignore"
            estimated_time = "none"
        
        return {
            "email_id": email.get("id"),
            "score": score,
            "category": category,
            "reasoning": reasoning,
            "factors": factors,
            "suggested_action": suggested_action,
            "estimated_response_time": estimated_time,
            "analyzed_at": datetime.utcnow().isoformat()
        }
    
    def batch_analyze(self, emails: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze multiple emails"""
        return [self.analyze_email(email) for email in emails]
    
    def get_priority_distribution(self, analyses: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get distribution of priority categories"""
        distribution = {"urgent": 0, "important": 0, "normal": 0, "low": 0}
        for analysis in analyses:
            category = analysis.get("category", "normal")
            distribution[category] = distribution.get(category, 0) + 1
        return distribution


# Example usage
if __name__ == "__main__":
    service = PriorityService()
    
    test_emails = [
        {
            "id": "1",
            "sender": "boss@company.com",
            "subject": "Urgent: Q1 report needed today",
            "preview": "Please submit the Q1 report by end of day. This is urgent.",
        },
        {
            "id": "2",
            "sender": "newsletter@tech.com",
            "subject": "Weekly Tech News",
            "preview": "This week's top stories in technology...",
        }
    ]
    
    for email in test_emails:
        result = service.analyze_email(email)
        print(f"\n{email['subject']}: {result['score']} ({result['category']})")
        print(f"Reason: {result['reasoning']}")
