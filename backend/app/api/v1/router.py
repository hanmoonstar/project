from fastapi import APIRouter

from app.api.v1.endpoints import auth, inbox, workflows, health, nlp, priority, reply, templates, conflicts, optimizer, meetings

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(inbox.router, prefix="/inbox", tags=["inbox"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(nlp.router, prefix="/nlp", tags=["nlp"])
api_router.include_router(priority.router, prefix="/priority", tags=["priority"])
api_router.include_router(reply.router, prefix="/reply", tags=["reply"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(conflicts.router, prefix="/conflicts", tags=["conflicts"])
api_router.include_router(optimizer.router, prefix="/optimizer", tags=["optimizer"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
