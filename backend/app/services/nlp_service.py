"""
Natural Language Workflow Service
Convert user text into structured workflow configuration using AI
"""

import json
import re
from typing import Dict, Any, Optional
from app.core.config import settings


class NLPService:
    """Parse natural language into workflow configuration"""
    
    def __init__(self):
        self.huggingface_api_key = settings.HUGGINGFACE_API_KEY
    
    def parse_workflow(self, user_input: str) -> Dict[str, Any]:
        """
        Parse natural language into workflow configuration
        
        Examples:
        - "每天早上9点，把未读邮件总结发给我"
        - "收到老板邮件时，自动标记为高优先级"
        - "每周五下午6点，汇总本周工作"
        """
        try:
            return self._parse_with_huggingface(user_input)
        except Exception as e:
            print(f"Hugging Face parsing failed: {e}, falling back to rules")
            return self._parse_with_rules(user_input)
    
    def _parse_with_huggingface(self, user_input: str) -> Dict[str, Any]:
        """Use Hugging Face to parse natural language"""
        import requests
        
        prompt = f"""
Parse the following natural language command into a structured workflow configuration.

User command: "{user_input}"

Extract and return a JSON object with these fields:
- name: A short name for this workflow (max 5 words)
- description: What this workflow does
- trigger_type: One of [schedule, email_received, webhook]
- trigger_config: Object with trigger-specific settings
  - For schedule: {{"cron": "cron expression", "timezone": "Asia/Shanghai"}}
  - For email_received: {{"conditions": [{{"field": "sender|subject|content", "operator": "contains|equals", "value": "..."}}]}}
- actions: Array of action objects, each with:
  - type: One of [fetch_emails, filter_emails, summarize, send_digest, mark_priority, forward, create_task, send_notification]
  - config: Action-specific configuration

Common patterns:
- "每天/每周/每月" → schedule with cron
- "收到...邮件" → email_received trigger
- "总结/摘要" → summarize action
- "标记为高优先级" → mark_priority action
- "转发给..." → forward action
- "创建任务/待办" → create_task action

Return ONLY valid JSON, no markdown, no explanation.
"""
        
        # Use Hugging Face Inference API with a free model
        headers = {}
        if self.huggingface_api_key:
            headers["Authorization"] = f"Bearer {self.huggingface_api_key}"
        
        response = requests.post(
            "https://api-inference.huggingface.co/models/google/flan-t5-large",
            headers=headers,
            json={"inputs": prompt, "parameters": {"max_length": 1000, "temperature": 0.1}}
        )
        
        if response.status_code == 200:
            result = response.json()[0]['generated_text']
            # Clean up markdown code blocks if present
            result = re.sub(r'```json\s*', '', result)
            result = re.sub(r'```\s*', '', result)
            
            workflow_config = json.loads(result)
            workflow_config["raw_input"] = user_input
            return workflow_config
        else:
            raise Exception(f"Hugging Face API error: {response.status_code}")
    
    def _parse_with_rules(self, user_input: str) -> Dict[str, Any]:
        """Rule-based parsing as fallback"""
        user_input_lower = user_input.lower()
        
        # Initialize default structure
        config = {
            "name": "自定义工作流",
            "description": user_input,
            "trigger_type": "schedule",
            "trigger_config": {},
            "actions": [],
            "raw_input": user_input
        }
        
        # Detect trigger type
        if any(word in user_input_lower for word in ["每天", "每周", "每月", "早上", "晚上", "定时"]):
            config["trigger_type"] = "schedule"
            config["trigger_config"] = self._parse_schedule(user_input_lower)
        elif any(word in user_input_lower for word in ["收到", "当", "如果"]):
            config["trigger_type"] = "email_received"
            config["trigger_config"] = self._parse_email_conditions(user_input_lower)
        
        # Detect actions
        config["actions"] = self._parse_actions(user_input_lower)
        
        # Generate name
        config["name"] = self._generate_name(user_input)
        
        return config
    
    def _parse_schedule(self, text: str) -> Dict[str, str]:
        """Parse schedule patterns"""
        config = {"timezone": "Asia/Shanghai"}
        
        # Time patterns
        time_match = re.search(r'(\d{1,2})[:点](\d{0,2})', text)
        hour = int(time_match.group(1)) if time_match else 9
        minute = int(time_match.group(2)) if time_match and time_match.group(2) else 0
        
        # Frequency patterns
        if "每天" in text or "每日" in text:
            config["cron"] = f"{minute} {hour} * * *"
            config["frequency"] = "daily"
        elif "每周" in text:
            day = 1  # Default Monday
            if "周一" in text: day = 1
            elif "周二" in text: day = 2
            elif "周三" in text: day = 3
            elif "周四" in text: day = 4
            elif "周五" in text: day = 5
            elif "周六" in text: day = 6
            elif "周日" in text: day = 0
            config["cron"] = f"{minute} {hour} * * {day}"
            config["frequency"] = "weekly"
        elif "每月" in text:
            config["cron"] = f"{minute} {hour} 1 * *"
            config["frequency"] = "monthly"
        else:
            config["cron"] = f"{minute} {hour} * * *"
            config["frequency"] = "daily"
        
        return config
    
    def _parse_email_conditions(self, text: str) -> Dict[str, Any]:
        """Parse email trigger conditions"""
        conditions = []
        
        # Sender patterns
        if "老板" in text or "经理" in text or "领导" in text:
            conditions.append({"field": "sender", "operator": "contains", "value": "boss"})
        if "客户" in text:
            conditions.append({"field": "sender", "operator": "contains", "value": "client"})
        
        # Subject patterns
        if "发票" in text:
            conditions.append({"field": "subject", "operator": "contains", "value": "发票"})
        if "合同" in text:
            conditions.append({"field": "subject", "operator": "contains", "value": "合同"})
        
        return {"conditions": conditions}
    
    def _parse_actions(self, text: str) -> list:
        """Parse action patterns"""
        actions = []
        
        # Fetch emails
        if any(word in text for word in ["邮件", "未读", "新邮件"]):
            actions.append({
                "type": "fetch_emails",
                "config": {"filter": "unread", "time_range": "24h"}
            })
        
        # Summarize
        if any(word in text for word in ["总结", "摘要", "汇总", "概括"]):
            actions.append({
                "type": "summarize",
                "config": {"model": "gpt-3.5-turbo", "max_length": 200}
            })
        
        # Mark priority
        if any(word in text for word in ["高优先级", "重要", "标记"]):
            actions.append({
                "type": "mark_priority",
                "config": {"priority": "high"}
            })
        
        # Send digest
        if any(word in text for word in ["发给我", "发送", "推送"]):
            actions.append({
                "type": "send_digest",
                "config": {"destination": "email", "format": "markdown"}
            })
        
        # Forward
        if "转发" in text:
            actions.append({
                "type": "forward",
                "config": {"target": "extract_from_text"}
            })
        
        # Create task
        if any(word in text for word in ["创建任务", "待办", "todo"]):
            actions.append({
                "type": "create_task",
                "config": {"platform": "default"}
            })
        
        # Default action if none detected
        if not actions:
            actions.append({
                "type": "fetch_emails",
                "config": {"filter": "unread"}
            })
        
        return actions
    
    def _generate_name(self, text: str) -> str:
        """Generate workflow name from text"""
        # Extract key elements
        time_match = re.search(r'(每天|每周|每月|早上|晚上)', text)
        action_match = re.search(r'(总结|摘要|标记|转发|创建)', text)
        target_match = re.search(r'(邮件|任务|待办)', text)
        
        parts = []
        if time_match:
            parts.append(time_match.group(1))
        if action_match:
            parts.append(action_match.group(1))
        if target_match:
            parts.append(target_match.group(1))
        
        if parts:
            return "".join(parts[:3])
        else:
            return "自定义工作流"


# Example usage
if __name__ == "__main__":
    service = NLPService()
    
    test_inputs = [
        "每天早上9点，把未读邮件总结发给我",
        "收到老板邮件时，自动标记为高优先级",
        "每周五下午6点，汇总本周工作进度",
        "收到带'发票'的邮件，转发给财务并创建待办",
    ]
    
    for text in test_inputs:
        print(f"\n输入: {text}")
        result = service.parse_workflow(text)
        print(f"解析结果: {json.dumps(result, ensure_ascii=False, indent=2)}")
