#!/usr/bin/env python
"""
Celery Worker Entry Point

Run with: py celery_worker.py
Or: celery -A app.core.celery worker --loglevel=info
"""

import os
import sys

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Ensure we're using the right Python
print(f"Python: {sys.executable}")

try:
    from app.core.celery import celery_app
    from app.tasks import workflow_tasks, email_tasks
    print("✅ Imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please run: py -m pip install celery redis")
    sys.exit(1)

if __name__ == "__main__":
    print("🚀 Starting Celery Worker...")
    # Start worker
    celery_app.worker_main([
        "worker",
        "--loglevel=info",
        "--concurrency=2",
        "-n", "focusflow_worker@%h"
    ])
