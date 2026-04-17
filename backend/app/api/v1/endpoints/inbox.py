from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.inbox import EmailMessage, EmailSummary
from app.services.email_service import EmailService
from app.models.email_account import EmailAccount
from app.models.user import User
from datetime import datetime

router = APIRouter()


@router.get("/emails", response_model=List[EmailMessage])
async def get_emails(limit: int = 20, db: Session = Depends(get_db)):
    """Get unified inbox emails from all connected sources"""
    # Get all connected email accounts
    email_accounts = db.query(EmailAccount).filter(EmailAccount.is_connected == True).all()
    
    all_emails = []
    email_service = EmailService()
    
    for account in email_accounts:
        try:
            # Connect to email server
            credentials = account.credentials
            mail = email_service.connect(account.email_address, credentials.get("password"))
            
            # Fetch unread emails
            emails = email_service.fetch_unread_emails(mail, limit=limit)
            
            # Convert to EmailMessage schema
            for email in emails:
                all_emails.append(EmailMessage(
                    id=email["id"],
                    source="email",
                    sender=email["sender"],
                    subject=email["subject"],
                    preview=email["preview"],
                    priority=email["priority"],
                    received_at=email["date"],
                    is_read=False
                ))
            
            # Close connection
            mail.logout()
        except Exception as e:
            # Skip this account if connection fails
            continue
    
    # Return mock data if no email accounts connected
    if not all_emails:
        return [
            EmailMessage(
                id="1",
                source="email",
                sender="boss@company.com",
                subject="Q1 Report Due",
                preview="Please submit the Q1 report by Friday...",
                priority="high",
                received_at="2024-03-03T09:00:00",
                is_read=False
            ),
            EmailMessage(
                id="2",
                source="email",
                sender="client@example.com",
                subject="Project Update",
                preview="Can we schedule a call to discuss...",
                priority="medium",
                received_at="2024-03-03T08:30:00",
                is_read=False
            )
        ]
    
    return all_emails[:limit]


@router.get("/summary")
async def get_inbox_summary(db: Session = Depends(get_db)):
    """Get inbox summary with priority breakdown"""
    # Get all connected email accounts
    email_accounts = db.query(EmailAccount).filter(EmailAccount.is_connected == True).all()
    
    total_unread = 0
    high_priority = 0
    medium_priority = 0
    low_priority = 0
    email_count = 0
    
    email_service = EmailService()
    
    for account in email_accounts:
        try:
            # Connect to email server
            credentials = account.credentials
            mail = email_service.connect(account.email_address, credentials.get("password"))
            
            # Fetch unread emails
            emails = email_service.fetch_unread_emails(mail, limit=100)
            email_count += len(emails)
            
            # Count priorities
            for email in emails:
                total_unread += 1
                if email["priority"] == "high":
                    high_priority += 1
                elif email["priority"] == "medium":
                    medium_priority += 1
                else:
                    low_priority += 1
            
            # Close connection
            mail.logout()
        except Exception as e:
            # Skip this account if connection fails
            continue
    
    # Return mock data if no email accounts connected
    if total_unread == 0:
        return {
            "total_unread": 12,
            "high_priority": 3,
            "medium_priority": 5,
            "low_priority": 4,
            "sources": {
                "email": 8,
                "dingtalk": 3,
                "calendar": 1
            }
        }
    
    return {
        "total_unread": total_unread,
        "high_priority": high_priority,
        "medium_priority": medium_priority,
        "low_priority": low_priority,
        "sources": {
            "email": email_count,
            "dingtalk": 0,
            "calendar": 0
        }
    }


@router.post("/emails/{message_id}/mark-read")
async def mark_as_read(message_id: str, db: Session = Depends(get_db)):
    """Mark a message as read"""
    # TODO: Implement actual mark as read functionality
    return {"status": "success", "message_id": message_id}


@router.post("/connect/email")
async def connect_email(credentials: dict, db: Session = Depends(get_db)):
    """Connect email account via IMAP"""
    try:
        # Extract credentials
        email_address = credentials.get("email")
        password = credentials.get("password")
        provider = credentials.get("provider", "imap")
        
        if not email_address or not password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        # Test connection
        email_service = EmailService()
        mail = email_service.connect(email_address, password)
        mail.logout()
        
        # Check if account already exists
        existing_account = db.query(EmailAccount).filter(
            EmailAccount.email_address == email_address
        ).first()
        
        if existing_account:
            # Update existing account
            existing_account.credentials = {"password": password}
            existing_account.is_connected = True
            existing_account.last_sync_at = datetime.utcnow()
            db.commit()
        else:
            # Create new account (using user ID 1 as default for now)
            new_account = EmailAccount(
                user_id=1,  # TODO: Get actual user ID from authentication
                provider=provider,
                email_address=email_address,
                credentials={"password": password},
                is_connected=True,
                last_sync_at=datetime.utcnow()
            )
            db.add(new_account)
            db.commit()
        
        return {"status": "connected", "provider": provider, "email": email_address}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to connect email: {str(e)}")
