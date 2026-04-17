#!/usr/bin/env python
"""
Celery Beat Scheduler Entry Point

Run with: python celery_beat.py
Or: celery -A app.core.celery beat --loglevel=info
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.celery import celery_app

# Schedule configuration
celery_app.conf.beat_schedule = {
    "morning-digest": {
        "task": "app.tasks.workflow_tasks.morning_digest_workflow",
        "schedule": 60.0 * 60 * 24,  # Run every 24 hours (86400 seconds)
        # For testing: "schedule": 60.0,  # Run every 60 seconds
    },
    "check-scheduled-workflows": {
        "task": "app.tasks.workflow_tasks.schedule_workflows",
        "schedule": 60.0,  # Check every minute
    },
}

if __name__ == "__main__":
    celery_app.start([
        "beat",
        "--loglevel=info",
    ])
