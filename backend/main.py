from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import json

from core.ai_client import ask_deepseek
from db_config import get_db_connection
from database.repository import Repository
import schemas
from core.rag_engine import assemble_context

# --- TAMBAHAN UNTUK GOOGLE LOGIN ---
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:5173"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- KONFIGURASI AUTHENTICATION ---
GOOGLE_CLIENT_ID = "165884247058-favgat2bm3k71g6sup4gk5uuv3h0offg.apps.googleusercontent.com"

class GoogleAuthRequest(BaseModel):
    token: str

class LocalLoginRequest(BaseModel):
    username: str
    password: str

# Schema untuk registrasi user
class UserRegisterRequest(BaseModel):
    admin_id: str  # Email atau Username dari Super Admin yang sedang login
    email: str
    name: str
    role: str
    division: str

# Schema untuk update user
class UserUpdateRequest(BaseModel):
    admin_id: str
    role: str
    division: str

# 1. JALUR GOOGLE WORKSPACE (UNTUK KARYAWAN)
@app.post("/api/auth/google")
async def google_auth(request: GoogleAuthRequest):
    try:
        # Verifikasi token Google
        idinfo = id_token.verify_oauth2_token(request.token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo.get('email')
        
        # Buka koneksi ke Database
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Gagal terhubung ke database")
            
        try:
            cur = conn.cursor()
            
            # Cek apakah email SUDAH didaftarkan oleh Admin
            cur.execute("SELECT role, division, name FROM users WHERE email = %s", (email,))
            user_record = cur.fetchone()
            
            if user_record:
                # Jika ada, izinkan masuk dan ambil datanya
                user_role = user_record[0]
                user_division = user_record[1]
                user_name = user_record[2]
                
                return {
                    "status": "success",
                    "user": {
                        "email": email,
                        "name": user_name,
                        "role": user_role,
                        "division": user_division
                    }
                }
            else:
                # Jika tidak ada, tolak dengan tegas (Strict Whitelisting)
                raise HTTPException(
                    status_code=403, 
                    detail="Akun Anda belum terdaftar. Silakan hubungi Tim IT untuk registrasi email."
                )
                
        finally:
            cur.close()
            conn.close()
            
    except ValueError:
        raise HTTPException(status_code=401, detail="Token Google tidak valid atau kadaluarsa")
    except HTTPException:
        raise # Lempar error 403 atau 401 ke frontend
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. JALUR LOKAL (KHUSUS UNTUK TIM IT / SUPER ADMIN)
@app.post("/api/auth/local")
async def local_auth(request: LocalLoginRequest):
    try:
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Gagal terhubung ke database")
            
        try:
            cur = conn.cursor()
            
            # Cek kecocokan username dan password
            cur.execute(
                "SELECT email, name, role, division FROM users WHERE username = %s AND password = %s",
                (request.username, request.password)
            )
            admin_record = cur.fetchone()
            
            if admin_record:
                return {
                    "status": "success",
                    "user": {
                        "email": admin_record[0] or request.username, # Fallback ke username jika email null
                        "name": admin_record[1],
                        "role": admin_record[2],
                        "division": admin_record[3]
                    }
                }
            else:
                raise HTTPException(status_code=401, detail="Akses ditolak: Username atau Password salah.")
                
        finally:
            cur.close()
            conn.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. ENDPOINT REGISTRASI USER BARU (KHUSUS SUPER ADMIN)
@app.post("/api/users/register")
async def register_user(request: UserRegisterRequest):
    try:
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Gagal terhubung ke database")
            
        try:
            cur = conn.cursor()
            
            # --- 1. VERIFIKASI KEAMANAN: Pastikan yang me-request benar-benar SUPER_ADMIN ---
            cur.execute("SELECT role FROM users WHERE email = %s OR username = %s", (request.admin_id, request.admin_id))
            admin_record = cur.fetchone()
            
            if not admin_record or admin_record[0] != "SUPER_ADMIN":
                raise HTTPException(status_code=403, detail="Akses Ditolak: Hanya Super Admin yang dapat mendaftarkan akun baru.")
            
            # --- 2. VALIDASI LOGIKA BISNIS ---
            if request.role == "SUPER_ADMIN" and request.division != "IT":
                raise HTTPException(status_code=400, detail="Kesalahan Sistem: Hak akses Super Admin hanya dapat diberikan untuk Divisi IT.")

            # --- 3. PROSES REGISTRASI ---
            # Pastikan email belum pernah didaftarkan
            cur.execute("SELECT email FROM users WHERE email = %s", (request.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email workspace ini sudah terdaftar di sistem!")
                
            # Masukkan user baru
            cur.execute(
                "INSERT INTO users (email, name, role, division) VALUES (%s, %s, %s, %s)",
                (request.email, request.name, request.role, request.division)
            )
            conn.commit()
            
            return {"status": "success", "message": f"Akses untuk {request.name} ({request.role}) berhasil dibuat!"}
            
        finally:
            cur.close()
            conn.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. ENDPOINT AMBIL SEMUA DATA USER
@app.get("/api/users")
async def get_all_users(admin_id: str):
    try:
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Gagal terhubung ke database")
            
        try:
            cur = conn.cursor()
            
            # Verifikasi bahwa yang meminta data adalah SUPER_ADMIN
            cur.execute("SELECT role FROM users WHERE email = %s OR username = %s", (admin_id, admin_id))
            admin_record = cur.fetchone()
            
            if not admin_record or admin_record[0] != "SUPER_ADMIN":
                raise HTTPException(status_code=403, detail="Akses Ditolak.")
                
            # Ambil semua user
            cur.execute("SELECT id, email, name, role, division, username FROM users ORDER BY id DESC")
            users = [{"id": row[0], "email": row[1], "name": row[2], "role": row[3], "division": row[4], "username": row[5]} for row in cur.fetchall()]
            
            return {"status": "success", "data": users}
        finally:
            cur.close()
            conn.close()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. ENDPOINT UPDATE JABATAN & DIVISI USER
@app.patch("/api/users/{user_id}")
async def update_user(user_id: int, request: UserUpdateRequest):
    try:
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Gagal terhubung ke database")
            
        try:
            cur = conn.cursor()
            
            # Verifikasi Super Admin
            cur.execute("SELECT role FROM users WHERE email = %s OR username = %s", (request.admin_id, request.admin_id))
            admin_record = cur.fetchone()
            if not admin_record or admin_record[0] != "SUPER_ADMIN":
                raise HTTPException(status_code=403, detail="Akses Ditolak.")
            
            # Validasi logika divisi IT
            if request.role == "SUPER_ADMIN" and request.division != "IT":
                raise HTTPException(status_code=400, detail="Super Admin harus berada di divisi IT.")
                
            # Eksekusi Update (Kita hanya mengizinkan update role dan division)
            cur.execute(
                "UPDATE users SET role = %s, division = %s WHERE id = %s",
                (request.role, request.division, user_id)
            )
            conn.commit()
            
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="User tidak ditemukan.")
                
            return {"status": "success", "message": "Data user berhasil diperbarui!"}
        finally:
            cur.close()
            conn.close()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT CHAT ---
@app.post("/api/chat")
async def chat_with_ai(request: schemas.ChatRequest):
    try:
        prompt_with_context = assemble_context(request.divisi, request.message)
        
        if not prompt_with_context:
            return {"reply": f"Maaf, dokumen SOP untuk divisi {request.divisi} belum tersedia di database."}

        ai_response = ask_deepseek(prompt_with_context, request.history)
        
        intent = ai_response.get("intent", "qa")
        action_type = ai_response.get("action_type")
        bot_reply = ai_response.get("reply", "Maaf, format respons tidak dikenali.")

        if intent == "action":
            conn = get_db_connection()
            if conn:
                try:
                    cur = conn.cursor()
                    
                    insert_query = """
                        INSERT INTO action_approvals ("action_type", "division", "status", "payload", "ai_reasoning")
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    
                    payload_data = json.dumps({
                        "raw_request": request.message,
                        "requested_by": request.user_id
                    })
                    
                    cur.execute(insert_query, (
                        action_type, 
                        request.divisi, 
                        "Pending", 
                        payload_data, 
                        bot_reply
                    ))
                    conn.commit()
                    cur.close()
                except Exception as db_err:
                    print(f"Gagal menyimpan ke database: {db_err}")
                finally:
                    conn.close()

            final_reply = f"⚙️ [STATUS: MENUNGGU APPROVAL SPV]\nPermintaan aksi '{action_type}' telah dicatat di sistem dan menunggu persetujuan dari Supervisor.\n\n{bot_reply}"
        else:
            final_reply = bot_reply

        return {
            "reply": final_reply,
            "intent": intent,
            "status": "success"
        }

    except Exception as e:
        return {"error": f"Gagal memproses AI: {str(e)}"}
    
# --- ENDPOINT LOGS & HISTORY ---
@app.get("/api/approval-logs")
async def get_approval_logs():
    try:
        conn = get_db_connection()
        if not conn:
            return {"error": "Koneksi database gagal."}
            
        cur = conn.cursor()
        cur.execute("""
            SELECT id, action_type, division, status, payload, ai_reasoning, created_at 
            FROM action_approvals 
            WHERE status = 'Pending'
            ORDER BY created_at DESC
        """)
        
        rows = cur.fetchall()
        
        logs = []
        for row in rows:
            logs.append({
                "id": row[0],
                "action": row[1],
                "category": row[2],
                "status": row[3],
                "request": row[4].get("raw_request", "") if isinstance(row[4], dict) else str(row[4]),
                "aiResponse": row[5],
                "time": str(row[6])
            })

        cur.close()
        conn.close()
        
        return {"data": logs, "status": "success"}
        
    except Exception as e:
        return {"error": f"Terjadi kesalahan: {str(e)}"}

@app.patch("/api/approval-logs/{log_id}")
async def update_approval_status(log_id: int, action: schemas.ApprovalAction):
    try:
        conn = get_db_connection()
        if not conn:
            return {"error": "Koneksi database gagal."}
            
        cur = conn.cursor()
        
        update_query = "UPDATE action_approvals SET status = %s WHERE id = %s"
        cur.execute(update_query, (action.status, log_id))
        conn.commit()
        
        row_count = cur.rowcount
        
        cur.close()
        conn.close()
        
        if row_count == 0:
            return {"error": f"Log dengan ID {log_id} tidak ditemukan.", "status": "failed"}
            
        return {"message": f"Aksi {log_id} berhasil diubah menjadi {action.status}.", "status": "success"}
        
    except Exception as e:
        return {"error": f"Terjadi kesalahan saat update: {str(e)}"}
    
@app.get("/api/approval-history")
async def get_approval_history():
    try:
        conn = get_db_connection()
        if not conn:
            return {"error": "Koneksi database gagal."}
            
        cur = conn.cursor()
        cur.execute("""
            SELECT id, action_type, division, status, payload, ai_reasoning, created_at 
            FROM action_approvals 
            WHERE status IN ('Approved', 'Rejected')
            ORDER BY created_at DESC
        """)
        
        rows = cur.fetchall()
        
        logs = []
        for row in rows:
            logs.append({
                "id": row[0],
                "action": row[1],
                "category": row[2],
                "status": row[3],
                "request": row[4].get("raw_request", "") if isinstance(row[4], dict) else str(row[4]),
                "aiResponse": row[5],
                "time": str(row[6])
            })

        cur.close()
        conn.close()
        
        return {"data": logs, "status": "success"}
        
    except Exception as e:
        return {"error": f"Terjadi kesalahan: {str(e)}"}

@app.get("/api/test-db")
async def test_database_connection():
    try:
        conn = get_db_connection()
        if conn:
            cur = conn.cursor()
            cur.execute("SELECT version();")
            db_version = cur.fetchone()
            
            cur.close()
            conn.close()
            
            return {
                "status": "BERHASIL", 
                "message": "Backend sukses terhubung ke PostgreSQL!", 
                "version": db_version[0]
            }
        else:
            return {"status": "GAGAL", "message": "Koneksi ditolak. Cek kredensial di file .env"}
            
    except Exception as e:
        return {"status": "ERROR", "detail": str(e)}

@app.get("/")
async def root():
    return {"status": "Backend Radikari Assistant V3 - Terhubung ke PostgreSQL!"}

@app.get("/api/debug-kolom")
async def debug_kolom():
    try:
        conn = get_db_connection()
        if not conn:
            return {"error": "Koneksi database gagal"}
            
        cur = conn.cursor()
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'action_approvals';
        """)
        kolom = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            "pesan": "Ini adalah daftar kolom yang dilihat oleh Python saat ini:",
            "daftar_kolom": [k[0] for k in kolom]
        }
    except Exception as e:
        return {"error": str(e)}