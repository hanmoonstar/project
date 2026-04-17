from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any, Optional


class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Dict[str, Any]
    actions: List[Dict[str, Any]]


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowResponse(WorkflowBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WorkflowExecution(BaseModel):
    id: int
    workflow_id: int
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
