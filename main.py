from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os

# Import Database & Models
from database import engine, get_db
import models
import schemas

# Import LangChain & DeepSeek
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain

# Sinkronisasi Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Satpam CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",   # Tambahkan ini untuk Vite
        "http://127.0.0.1:5173"    # IP lokal Vite
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. SETUP MODEL AI (DEEPSEEK)
# ==========================================
llm = Ollama(model="deepseek-chat") 
embeddings = OllamaEmbeddings(model="nomic-embed-text") 

def get_retriever_for_division(divisi: str):
    folder_path = f"./knowledge_base/{divisi}"
    if not os.path.exists(folder_path):
        return None
    loader = DirectoryLoader(folder_path, glob="**/*.md", loader_cls=TextLoader)
    docs = loader.load()
    if not docs:
        return None
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_documents(docs)
    vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings)
    return vectorstore.as_retriever(search_kwargs={"k": 3})

system_prompt = (
    "Kamu adalah asisten AI di OpenClaw. Jawablah pertanyaan pengguna HANYA berdasarkan informasi dari dokumen berikut ini.\n"
    "Jika jawabannya tidak ada di dalam dokumen, katakan 'Maaf, informasi tersebut tidak ada di dalam SOP saya.' Jangan mengarang jawaban.\n\n"
    "Konteks Dokumen:\n{context}"
)
prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

# ==========================================
# 2. ENDPOINT API: CHAT ASSISTANT
# ==========================================
@app.post("/api/chat")
async def chat_with_ai(request: schemas.ChatRequest):
    try:
        retriever = get_retriever_for_division(request.divisi)
        if retriever:
            question_answer_chain = create_stuff_documents_chain(llm, prompt)
            rag_chain = create_retrieval_chain(retriever, question_answer_chain)
            response = rag_chain.invoke({"input": request.message})
            return {"reply": response["answer"]}
        else:
            return {"reply": f"Maaf, dokumen SOP untuk divisi {request.divisi} belum tersedia."}
    except Exception as e:
        return {"error": f"Gagal memproses AI: {str(e)}"}

# ==========================================
# 3. ENDPOINT API: GOOGLE OAUTH LOGIN
# ==========================================
GOOGLE_CLIENT_ID = "MASUKKAN_CLIENT_ID_GOOGLE_ANDA_DISINI.apps.googleusercontent.com"

@app.post("/api/auth/google")
async def google_login(request: schemas.TokenRequest, db: Session = Depends(get_db)):
    try:
        # Verifikasi token dari React ke server Google
        idinfo = id_token.verify_oauth2_token(request.token, google_requests.Request(), GOOGLE_CLIENT_ID)
        user_email = idinfo['email']
        user_name = idinfo.get('name', 'User')

        # Cek database, jika user belum ada, buat profil baru
        db_user = db.query(models.User).filter(models.User.email == user_email).first()
        if not db_user:
            new_user = models.User(username=user_name, email=user_email, role="staff")
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            db_user = new_user

        return {"message": "Login Success", "user": {"id": db_user.id, "email": db_user.email, "role": db_user.role, "name": db_user.username}}
    except ValueError:
        raise HTTPException(status_code=401, detail="Token Google tidak valid")

# ==========================================
# 4. ENDPOINT API: APPROVAL DASHBOARD
# ==========================================
@app.get("/api/approval-logs", response_model=list[schemas.ApprovalLogResponse])
async def get_approval_logs(db: Session = Depends(get_db)):
    # Menarik data dari database dan mengubah formatnya agar cocok dengan UI React Anda
    logs = db.query(models.ApprovalLog).all()
    ui_logs = []
    for log in logs:
        # Mengambil nama user jika ada relasinya
        user_name = log.user.username if log.user else "UNKNOWN USER"
        
        ui_logs.append(schemas.ApprovalLogResponse(
            id=str(log.id),
            action="System Task", # Bisa disesuaikan dengan logika bisnis Anda
            category="General",
            user=user_name.upper(),
            status=log.status.capitalize(), # Mengubah "pending" menjadi "Pending"
            request=log.proposed_action,
            aiResponse=log.ai_prompt,
            time=log.created_at.strftime("%Y-%m-%d %H:%M")
        ))
    return ui_logs

@app.patch("/api/approval-logs/{log_id}")
async def update_approval_status(log_id: int, action: schemas.ApprovalAction, db: Session = Depends(get_db)):
    # Mengubah status (Approve/Reject) dari UI
    log = db.query(models.ApprovalLog).filter(models.ApprovalLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log tidak ditemukan")
    
    log.status = action.status.lower() # Simpan ke DB sebagai 'resolved' atau 'rejected'
    db.commit()
    return {"message": f"Log {log_id} berhasil diupdate menjadi {action.status}"}

# ==========================================
# ROOT CHECKER
# ==========================================
@app.get("/")
async def root():
    return {"status": "Backend OpenClaw V2 Beroperasi Penuh!"}