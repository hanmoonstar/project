"""
Smart Meeting Assistant Service
Extract decisions, action items, and responsibilities from meetings using Hugging Face
"""

from typing import Dict, Any, List
from dataclasses import dataclass
from datetime import datetime
import os
import json
import requests
from app.core.config import settings


@dataclass
class ActionItem:
    task: str
    assignee: str
    deadline: str
    priority: str


@dataclass
class Decision:
    topic: str
    decision: str
    stakeholders: List[str]


@dataclass
class MeetingSummary:
    title: str
    duration: int
    participants: List[str]
    decisions: List[Decision]
    action_items: List[ActionItem]
    key_points: List[str]


class MeetingAssistantService:
    """AI-powered meeting analysis using Hugging Face"""
    
    def __init__(self):
        self.huggingface_api_key = settings.HUGGINGFACE_API_KEY
    
    def analyze_transcript(self, transcript: str, title: str = "Meeting") -> MeetingSummary:
        """Analyze meeting transcript using Hugging Face"""
        try:
            return self._analyze_with_huggingface(transcript, title)
        except Exception as e:
            print(f"Hugging Face analysis failed: {e}, falling back to rules")
            return self._analyze_with_rules(transcript, title)
    
    def _analyze_with_huggingface(self, transcript: str, title: str) -> MeetingSummary:
        """Use Hugging Face to analyze meeting transcript"""
        prompt = f"""Analyze the following meeting transcript and extract structured information.

Transcript:
{transcript}

Extract and return a JSON object with the following structure:
{{
    "participants": ["name1", "name2", ...],
    "decisions": [
        {{
            "topic": "brief topic name",
            "decision": "what was decided",
            "stakeholders": ["involved people"]
        }}
    ],
    "action_items": [
        {{
            "task": "what needs to be done",
            "assignee": "who is responsible",
            "deadline": "when is it due",
            "priority": "high/medium/low"
        }}
    ],
    "key_points": ["important point 1", "important point 2", ...]
}}

Rules:
- Participants: Extract all people mentioned in the meeting
- Decisions: Capture any conclusions or agreements made
- Action items: Include specific tasks, who does them, and deadlines
- Priority: high (urgent/important), medium (normal), low (optional)
- Key points: Extract 3-5 most important discussion points"""

        # Use Hugging Face Inference API with a free model
        headers = {}
        if self.huggingface_api_key:
            headers["Authorization"] = f"Bearer {self.huggingface_api_key}"
        
        response = requests.post(
            "https://api-inference.huggingface.co/models/google/flan-t5-large",
            headers=headers,
            json={"inputs": prompt, "parameters": {"max_length": 2000, "temperature": 0.3}}
        )
        
        if response.status_code == 200:
            content = response.json()[0]['generated_text']
            # Extract JSON from response
            try:
                data = json.loads(content)
            except json.JSONDecodeError:
                # Try to extract JSON from markdown code block
                import re
                json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group(1))
                else:
                    raise
            
            decisions = [Decision(**d) for d in data.get("decisions", [])]
            action_items = [ActionItem(**a) for a in data.get("action_items", [])]
            
            return MeetingSummary(
                title=title,
                duration=self._estimate_duration(transcript),
                participants=data.get("participants", ["Unknown"]),
                decisions=decisions,
                action_items=action_items,
                key_points=data.get("key_points", [])
            )
        else:
            raise Exception(f"Hugging Face API error: {response.status_code}")
    
    def _analyze_with_rules(self, transcript: str, title: str) -> MeetingSummary:
        """Fallback rule-based analysis"""
        import re
        
        # Simple rule-based extraction
        participants = list(set(re.findall(r'([\u4e00-\u9fa5]{2,4})(?:：|:)\s*', transcript)))
        if not participants:
            participants = ["Unknown"]
        
        # Extract sentences that look like decisions
        decisions = []
        decision_patterns = [
            r'(?:决定|确定|拍板|定下来|决议)\s*[:：]\s*([^。]+)',
            r'(?:最终|最后)\s*(?:决定|确定)\s*[:：]\s*([^。]+)',
        ]
        for pattern in decision_patterns:
            matches = re.findall(pattern, transcript)
            for match in matches:
                decisions.append(Decision(
                    topic=match[:20],
                    decision=match.strip(),
                    stakeholders=[]
                ))
        
        # Extract action items
        action_items = []
        sentences = re.split(r'[。！？\n]', transcript)
        for sentence in sentences:
            if any(kw in sentence for kw in ['负责', '跟进', '处理', '完成']):
                action_items.append(ActionItem(
                    task=sentence.strip(),
                    assignee="TBD",
                    deadline="待定",
                    priority="medium"
                ))
        
        return MeetingSummary(
            title=title,
            duration=self._estimate_duration(transcript),
            participants=participants,
            decisions=decisions[:5],
            action_items=action_items[:10],
            key_points=[]
        )
    
    def _extract_participants(self, text: str) -> List[str]:
        """Extract meeting participants"""
        # Look for common name patterns
        patterns = [
            r'([\u4e00-\u9fa5]{2,4})(?:：|:)\s*',
            r'(?:张三|李四|王五|赵六|小陈|小李|小王|张总|李总|王经理)',
        ]
        
        participants = set()
        for pattern in patterns:
            matches = re.findall(pattern, text)
            participants.update(matches)
        
        return list(participants) if participants else ["Unknown"]
    
    def _extract_decisions(self, text: str) -> List[Decision]:
        """Extract decisions made in the meeting"""
        decisions = []
        
        # Decision patterns
        decision_markers = [
            r'(?:决定|确定|拍板|定下来|决议)\s*[:：]\s*([^。]+)',
            r'(?:decided|decision|agreed|concluded)\s*(?:that|to)?\s*[:：]\s*([^。.]+)',
            r'(?:最终|最后)\s*(?:决定|确定)\s*[:：]\s*([^。]+)',
        ]
        
        for pattern in decision_markers:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                decisions.append(Decision(
                    topic=self._extract_topic(match),
                    decision=match.strip(),
                    stakeholders=[]
                ))
        
        # If no explicit decisions found, look for consensus patterns
        if not decisions:
            consensus_pattern = r'(?:一致|大家|我们)\s*(?:同意|认为|觉得)\s*[:：]\s*([^。]+)'
            matches = re.findall(consensus_pattern, text)
            for match in matches:
                decisions.append(Decision(
                    topic=self._extract_topic(match),
                    decision=match.strip(),
                    stakeholders=[]
                ))
        
        return decisions[:5]  # Limit to top 5
    
    def _extract_action_items(self, text: str) -> List[ActionItem]:
        """Extract action items and assignments"""
        action_items = []
        
        # Split into sentences
        sentences = re.split(r'[。！？\n]', text)
        
        for sentence in sentences:
            # Look for action keywords
            if any(keyword in sentence for keyword in ['需要', '要', '必须', '得', '负责', '跟进', '处理', '完成', '准备', '提交']):
                assignee = self._extract_assignee(sentence)
                deadline = self._extract_deadline(sentence)
                
                action_items.append(ActionItem(
                    task=sentence.strip(),
                    assignee=assignee or "TBD",
                    deadline=deadline or "待定",
                    priority=self._determine_priority(sentence)
                ))
        
        return action_items[:10]  # Limit to top 10
    
    def _extract_assignee(self, text: str) -> str:
        """Extract who is assigned to a task"""
        for pattern in self.assignee_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
        
        # Look for names before action verbs
        name_pattern = r'([\u4e00-\u9fa5]{2,4})(?:来|去|把|将)'
        match = re.search(name_pattern, text)
        if match:
            return match.group(1)
        
        return ""
    
    def _extract_deadline(self, text: str) -> str:
        """Extract deadline from text"""
        for pattern in self.deadline_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        
        # Look for date patterns
        date_pattern = r'(\d{1,2})\s*[月/]\s*(\d{1,2})'
        match = re.search(date_pattern, text)
        if match:
            return f"{match.group(1)}月{match.group(2)}日"
        
        return ""
    
    def _determine_priority(self, text: str) -> str:
        """Determine priority of a task"""
        high_keywords = ['紧急', '重要', '必须', '马上', '立即', 'urgent', 'critical', 'asap']
        low_keywords = ['可以', '稍后', '有空', 'optional', 'if possible']
        
        text_lower = text.lower()
        
        if any(kw in text_lower for kw in high_keywords):
            return "high"
        elif any(kw in text_lower for kw in low_keywords):
            return "low"
        return "medium"
    
    def _extract_key_points(self, text: str) -> List[str]:
        """Extract key discussion points"""
        key_points = []
        
        # Look for important statements
        patterns = [
            r'(?:注意|重点|关键是|重要的是)\s*[:：]\s*([^。]+)',
            r'(?:key point|important|note that)\s*[:：]\s*([^。.]+)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            key_points.extend([m.strip() for m in matches])
        
        return key_points[:5]
    
    def _extract_topic(self, text: str) -> str:
        """Extract topic from decision text"""
        # Simple heuristic: first 10 chars or until punctuation
        topic = re.split(r'[，,。！？]', text)[0]
        return topic[:20] if len(topic) > 20 else topic
    
    def _estimate_duration(self, text: str) -> int:
        """Estimate meeting duration in minutes"""
        # Rough estimate: 150 words per minute
        word_count = len(text.split())
        return max(15, min(120, word_count // 150 * 60))
    
    def generate_summary_text(self, summary: MeetingSummary) -> str:
        """Generate human-readable summary"""
        lines = [
            f"# {summary.title}",
            f"",
            f"**Duration:** {summary.duration} minutes",
            f"**Participants:** {', '.join(summary.participants)}",
            f"",
            f"## Decisions",
        ]
        
        if summary.decisions:
            for i, d in enumerate(summary.decisions, 1):
                lines.append(f"{i}. **{d.topic}**: {d.decision}")
        else:
            lines.append("No major decisions recorded.")
        
        lines.extend(["", "## Action Items"])
        
        if summary.action_items:
            for i, item in enumerate(summary.action_items, 1):
                priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(item.priority, "⚪")
                lines.append(f"{i}. {priority_emoji} **{item.assignee}**: {item.task[:50]}... (Due: {item.deadline})")
        else:
            lines.append("No action items recorded.")
        
        if summary.key_points:
            lines.extend(["", "## Key Points"])
            for point in summary.key_points:
                lines.append(f"- {point}")
        
        return "\n".join(lines)


# Example usage
if __name__ == "__main__":
    service = MeetingAssistantService()
    
    test_transcript = """
    张三：我们今天讨论一下 Q4 的产品规划。
    李四：我觉得应该优先做移动端优化。
    王五：同意，但是也要兼顾 Web 端的性能。
    张三：最终确定，Q4 重点做移动端，Web 端做基础优化。
    李四：我来负责移动端的方案设计，下周三前提交初稿。
    王五：我来跟进 Web 端的性能优化，月底前完成。
    张三：好的，下周我们再同步进展。
    """
    
    summary = service.analyze_transcript(test_transcript, "Q4 产品规划会议")
    print(service.generate_summary_text(summary))
