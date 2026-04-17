import requests
from app.core.config import settings


class AIService:
    def __init__(self):
        self.huggingface_api_key = settings.HUGGINGFACE_API_KEY
    
    def summarize_emails(self, emails: list) -> str:
        """Generate summary of emails using Hugging Face"""
        try:
            email_text = "\n".join([
                f"From: {e['sender']}\nSubject: {e['subject']}\nPreview: {e['preview']}"
                for e in emails
            ])
            
            prompt = f"Summarize these emails in 2-3 bullet points:\n\n{email_text}"
            
            if self.huggingface_api_key:
                # Use Hugging Face Inference API with a free model
                response = requests.post(
                    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
                    headers={"Authorization": f"Bearer {self.huggingface_api_key}"},
                    json={"inputs": prompt, "parameters": {"max_length": 200, "min_length": 50}}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result[0]['summary_text']
                else:
                    # Fallback to free public model
                    return self._summarize_with_public_model(prompt)
            else:
                # Use free public model without API key
                return self._summarize_with_public_model(prompt)
        
        except Exception as e:
            # Fallback to basic summary if all else fails
            return self._basic_summary(emails)
    
    def _summarize_with_public_model(self, prompt: str) -> str:
        """Use free public Hugging Face model"""
        try:
            # Use a free public model endpoint
            response = requests.post(
                "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6",
                json={"inputs": prompt, "parameters": {"max_length": 200, "min_length": 50}}
            )
            
            if response.status_code == 200:
                result = response.json()
                return result[0]['summary_text']
            else:
                return self._basic_summary([])
        except Exception:
            return self._basic_summary([])
    
    def _basic_summary(self, emails: list) -> str:
        """Basic summary as final fallback"""
        high_priority = [e for e in emails if "urgent" in e.get("subject", "").lower()]
        
        summary = f"📧 You have {len(emails)} unread emails."
        if high_priority:
            summary += f"\n⚠️ {len(high_priority)} require urgent attention."
        
        summary += "\n\nKey items:"
        for email in emails[:3]:
            summary += f"\n• {email['subject']} ({email['sender']})"
        
        return summary
