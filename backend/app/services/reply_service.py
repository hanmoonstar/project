"""
AI Reply Generation Service
Generate intelligent email replies based on context
"""

import json
from typing import Dict, Any, List
from app.core.config import settings


class ReplyService:
    """AI-powered email reply generation"""
    
    def __init__(self):
        self.huggingface_api_key = settings.HUGGINGFACE_API_KEY
    
    def generate_reply(self, email: Dict[str, Any], tone: str = "professional") -> Dict[str, Any]:
        """
        Generate reply suggestions for an email
        
        Args:
            email: Email with subject, body, sender
            tone: professional|friendly|concise|formal
            
        Returns:
            {
                "subject": "Reply subject",
                "body": "Generated reply",
                "tone": "professional",
                "confidence": 0.95,
                "key_points": ["point1", "point2"]
            }
        """
        try:
            return self._generate_with_huggingface(email, tone)
        except Exception as e:
            print(f"Hugging Face reply generation failed: {e}")
            return self._generate_with_rules(email, tone)
    
    def _generate_with_huggingface(self, email: Dict[str, Any], tone: str) -> Dict[str, Any]:
        """Use Hugging Face to generate reply"""
        import requests
        
        prompt = f"""
Generate a reply to this email.

Original Email:
From: {email.get('sender', 'Unknown')}
Subject: {email.get('subject', 'No Subject')}
Content: {email.get('body', email.get('preview', ''))[:800]}

Tone: {tone}

Return JSON:
{{
    "subject": "Reply subject line",
    "body": "Full reply text",
    "confidence": 0.0-1.0,
    "key_points": ["main points addressed"]
}}

The reply should:
- Match the requested tone
- Address all questions/action items
- Be concise but complete
- Include appropriate greeting and sign-off
"""
        
        # Use Hugging Face Inference API with a free model
        headers = {}
        if self.huggingface_api_key:
            headers["Authorization"] = f"Bearer {self.huggingface_api_key}"
        
        response = requests.post(
            "https://api-inference.huggingface.co/models/google/flan-t5-large",
            headers=headers,
            json={"inputs": prompt, "parameters": {"max_length": 1000, "temperature": 0.7}}
        )
        
        if response.status_code == 200:
            result = response.json()[0]['generated_text']
            import re
            result = re.sub(r'```json\s*', '', result)
            result = re.sub(r'```\s*', '', result)
            
            reply = json.loads(result)
            reply["tone"] = tone
            return reply
        else:
            raise Exception(f"Hugging Face API error: {response.status_code}")
    
    def _generate_with_rules(self, email: Dict[str, Any], tone: str) -> Dict[str, Any]:
        """Rule-based reply generation"""
        subject = email.get('subject', '')
        body = email.get('body', email.get('preview', ''))
        sender = email.get('sender', '')
        
        # Detect email type
        is_question = any(kw in body.lower() for kw in ['?', '请问', '如何', '什么', '吗'])
        is_request = any(kw in body.lower() for kw in ['请', '需要', '希望', '能否', '可以'])
        is_urgent = any(kw in body.lower() for kw in ['urgent', '紧急', '尽快', 'asap'])
        
        # Generate subject
        if subject.lower().startswith('re:'):
            reply_subject = subject
        else:
            reply_subject = f"Re: {subject}"
        
        # Generate greeting based on tone
        greetings = {
            'professional': f"Hi {sender.split('@')[0]},",
            'friendly': f"Hey {sender.split('@')[0]}!",
            'formal': f"Dear {sender.split('@')[0]},",
            'concise': f"Hi,"
        }
        greeting = greetings.get(tone, greetings['professional'])
        
        # Generate body based on content analysis
        body_parts = [greeting, ""]
        
        if is_question:
            body_parts.append("Thanks for reaching out. I've reviewed your questions and here are my thoughts:")
        elif is_request:
            body_parts.append("Thanks for your email. I've noted your request and will address it below:")
        else:
            body_parts.append("Thanks for your email. Here's my response:")
        
        body_parts.append("")
        
        # Add response content
        if is_urgent:
            body_parts.append("I understand this is time-sensitive and will prioritize accordingly.")
        else:
            body_parts.append("I'll get back to you with more details soon.")
        
        body_parts.append("")
        
        # Add closing based on tone
        closings = {
            'professional': "Best regards,",
            'friendly': "Cheers,",
            'formal': "Sincerely,",
            'concise': "Thanks,"
        }
        body_parts.append(closings.get(tone, closings['professional']))
        body_parts.append("[Your Name]")
        
        reply_body = "\n".join(body_parts)
        
        # Extract key points
        key_points = []
        if is_question:
            key_points.append("Addressed questions")
        if is_request:
            key_points.append("Acknowledged request")
        if is_urgent:
            key_points.append("Marked as urgent")
        if not key_points:
            key_points.append("General response")
        
        return {
            "subject": reply_subject,
            "body": reply_body,
            "tone": tone,
            "confidence": 0.75,
            "key_points": key_points
        }
    
    def generate_reply_options(self, email: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate multiple reply options with different tones"""
        tones = ["professional", "friendly", "concise"]
        return [self.generate_reply(email, tone) for tone in tones]


# Example usage
if __name__ == "__main__":
    service = ReplyService()
    
    test_email = {
        "sender": "boss@company.com",
        "subject": "Q1 Report",
        "body": "Can you send me the Q1 report by tomorrow? We need it for the board meeting."
    }
    
    reply = service.generate_reply(test_email, "professional")
    print(f"Subject: {reply['subject']}")
    print(f"Body:\n{reply['body']}")
