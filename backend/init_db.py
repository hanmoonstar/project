#!/usr/bin/env python
"""Initialize database tables"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models import User, Workflow, EmailAccount

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Database tables created!")

# Create sample data
from app.core.database import SessionLocal
from app.models.workflow import Workflow, WorkflowExecution

db = SessionLocal()

# Check if workflows exist
existing = db.query(Workflow).first()
if not existing:
    print("Creating sample workflow...")
    workflow = Workflow(
        user_id=1,
        name="Morning Digest",
        description="Daily summary of important emails at 9 AM",
        trigger_type="schedule",
        trigger_config={"cron": "0 9 * * *"},
        actions=[
            {"type": "fetch_emails", "filter": "unread"},
            {"type": "summarize", "model": "gpt-4"},
            {"type": "send_digest", "destination": "email"}
        ],
        is_active=True
    )
    db.add(workflow)
    db.commit()
    print(f"✅ Created workflow with ID: {workflow.id}")
else:
    print("Sample workflow already exists")

db.close()
