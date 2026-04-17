from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict

# --- Schemas untuk Autentikasi (Google Workspace Nanti) ---
class TokenRequest(BaseModel):
    token: str

# --- Schemas untuk Chat AI ---
class ChatRequest(BaseModel):
    message: str
    divisi: str = "hr"
    
    # Menambahkan user_id opsional untuk antisipasi saat otentikasi diaktifkan
    user_id: Optional[str] = "anonim" 
    
    # BARU: Menambahkan variabel history agar AI memiliki "Ingatan" dari React
    history: Optional[List[Dict[str, str]]] = []

# --- Schemas untuk Approval Dashboard ---
class ApprovalAction(BaseModel):
    status: str  # Akan menerima "Resolved", "Approved", atau "Rejected"

class ApprovalLogResponse(BaseModel):
    id: str
    action: str
    category: str
    user: str
    status: str
    request: str
    aiResponse: str
    time: str

    # Pydantic V2 config (menggantikan class Config lama)
    model_config = ConfigDict(from_attributes=True)