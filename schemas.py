from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Schemas untuk Autentikasi ---
class TokenRequest(BaseModel):
    token: str

# --- Schemas untuk Chat AI ---
class ChatRequest(BaseModel):
    message: str
    divisi: str = "hr"

# --- Schemas untuk Approval Dashboard ---
class ApprovalAction(BaseModel):
    status: str  # Akan menerima "Resolved" atau "Rejected"

class ApprovalLogResponse(BaseModel):
    id: str
    action: str
    category: str
    user: str
    status: str
    request: str
    aiResponse: str
    time: str

    class Config:
        from_attributes = True