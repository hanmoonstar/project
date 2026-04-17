import imaplib
import email
from email.header import decode_header
from typing import List, Dict
import os

from app.core.config import settings


class EmailService:
    def __init__(self):
        self.default_imap_server = settings.EMAIL_IMAP_SERVER
        self.default_imap_port = settings.EMAIL_IMAP_PORT
        self.imap_servers = {
            'gmail.com': 'imap.gmail.com',
            'qq.com': 'imap.qq.com',
            '163.com': 'imap.163.com',
            '126.com': 'imap.126.com',
            'outlook.com': 'imap-mail.outlook.com',
            'hotmail.com': 'imap-mail.outlook.com',
            'live.com': 'imap-mail.outlook.com'
        }
    
    def get_imap_server(self, email_address: str) -> str:
        """Get IMAP server based on email domain"""
        domain = email_address.split('@')[-1]
        return self.imap_servers.get(domain, self.default_imap_server)
    
    def connect(self, email_address: str, password: str) -> imaplib.IMAP4_SSL:
        """Connect to IMAP server"""
        imap_server = self.get_imap_server(email_address)
        mail = imaplib.IMAP4_SSL(imap_server, self.default_imap_port)
        mail.login(email_address, password)
        return mail
    
    def fetch_unread_emails(self, mail: imaplib.IMAP4_SSL, limit: int = 20) -> List[Dict]:
        """Fetch unread emails from inbox"""
        mail.select("inbox")
        _, messages = mail.search(None, "UNSEEN")
        
        email_list = []
        message_ids = messages[0].split()
        
        # Get last N messages
        for msg_id in message_ids[-limit:]:
            _, msg_data = mail.fetch(msg_id, "(RFC822)")
            raw_email = msg_data[0][1]
            email_message = email.message_from_bytes(raw_email)
            
            # Parse email
            subject = self._decode_header(email_message["Subject"])
            sender = self._decode_header(email_message["From"])
            date = email_message["Date"]
            
            # Get preview (first 200 chars of body)
            preview = self._get_email_preview(email_message)
            
            email_list.append({
                "id": msg_id.decode(),
                "subject": subject,
                "sender": sender,
                "date": date,
                "preview": preview[:200] + "..." if len(preview) > 200 else preview,
                "priority": self._estimate_priority(subject, sender)
            })
        
        return email_list
    
    def _decode_header(self, header: str) -> str:
        """Decode email header"""
        if not header:
            return ""
        decoded, charset = decode_header(header)[0]
        if isinstance(decoded, bytes):
            return decoded.decode(charset or "utf-8")
        return decoded
    
    def _get_email_preview(self, email_message) -> str:
        """Extract text preview from email"""
        if email_message.is_multipart():
            for part in email_message.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain":
                    try:
                        body = part.get_payload(decode=True).decode()
                        return body.strip()
                    except:
                        continue
        else:
            try:
                return email_message.get_payload(decode=True).decode().strip()
            except:
                return ""
        return ""
    
    def _estimate_priority(self, subject: str, sender: str) -> str:
        """Simple priority estimation based on keywords"""
        high_keywords = ["urgent", "asap", "deadline", "important", "action required"]
        subject_lower = subject.lower()
        
        for keyword in high_keywords:
            if keyword in subject_lower:
                return "high"
        
        # Check if from boss/common important domains
        important_domains = ["boss", "ceo", "manager", "client"]
        sender_lower = sender.lower()
        for domain in important_domains:
            if domain in sender_lower:
                return "high"
        
        return "medium"
