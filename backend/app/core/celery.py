from celery import Celery
from app.core.config import settings

# Use Redis if available, otherwise use filesystem for testing
if settings.REDIS_URL:
    broker_url = settings.REDIS_URL
    backend_url = settings.REDIS_URL
else:
    # Use filesystem transport for testing without Redis
    broker_url = "filesystem://"
    backend_url = "file:///tmp/celery_results"

celery_app = Celery(
    "focusflow",
    broker=broker_url,
    backend=backend_url,
    include=["app.tasks.workflow_tasks", "app.tasks.email_tasks"]
)

# Filesystem transport settings
if broker_url.startswith("filesystem"):
    celery_app.conf.update(
        broker_transport_options={
            'data_folder_in': '/tmp/celery/data/in',
            'data_folder_out': '/tmp/celery/data/out',
            'data_folder_processed': '/tmp/celery/data/processed',
        }
    )

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    worker_prefetch_multiplier=1,
)
