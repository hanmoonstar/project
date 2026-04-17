from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EmailMessage(BaseModel):
    id: str
    source: str  # email, dingtalk, etc.
    sender: str
    subject: str
    preview: str
    priority: str  # high, medium, low
    received_at: datetime
    is_read: bool
    category: Optional[str] = None


class EmailSummary(BaseModel):
    total_unread: int
    high_priority: int
    medium_priority: int
    low_priority: int
    sources: dict
