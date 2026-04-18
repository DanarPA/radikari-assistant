from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import json  # Ditambahkan untuk menangani tipe data JSONB di database

from core.ai_client import ask_deepseek
from db_config import get_db_connection
from database.repository import Repository
import schemas
from core.rag_engine import assemble_context

app = FastAPI()

# Menambahkan port 5173 (bawaan Vite) agar frontend React bisa terkoneksi
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

@app.post("/api/chat")
async def chat_with_ai(request: schemas.ChatRequest):
    try:
        # 1. Merakit Konteks dari Database
        prompt_with_context = assemble_context(request.divisi, request.message)
        
        if not prompt_with_context:
            return {"reply": f"Maaf, dokumen SOP untuk divisi {request.divisi} belum tersedia di database."}

        # 2. Mengirim ke DeepSeek (dengan ingatan!)
        ai_response = ask_deepseek(prompt_with_context, request.history)
        
        # Mengekstrak data dari respons JSON
        intent = ai_response.get("intent", "qa")
        action_type = ai_response.get("action_type")
        bot_reply = ai_response.get("reply", "Maaf, format respons tidak dikenali.")

        # 3. Logika Percabangan & Pencatatan Database
        if intent == "action":
            # Buka koneksi ke database untuk menyimpan log
            conn = get_db_connection()
            if conn:
                try:
                    cur = conn.cursor()
                    
                    # Menghapus "requested_by" dari query SQL karena kolomnya tidak ada di database aslimu
                    insert_query = """
                        INSERT INTO action_approvals ("action_type", "division", "status", "payload", "ai_reasoning")
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    
                    # Titipkan data user_id ke dalam kolom payload (JSON)
                    payload_data = json.dumps({
                        "raw_request": request.message,
                        "requested_by": request.user_id
                    })
                    
                    # Eksekusi dengan 5 variabel saja, sesuai dengan kolom di atas
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

            # Tambahkan label informasi untuk user di UI
            final_reply = f"⚙️ [STATUS: MENUNGGU APPROVAL SPV]\nPermintaan aksi '{action_type}' telah dicatat di sistem dan menunggu persetujuan dari Supervisor.\n\n{bot_reply}"
        else:
            # Jika hanya tanya jawab biasa
            final_reply = bot_reply

        # 4. Mengembalikan Jawaban
        return {
            "reply": final_reply,
            "intent": intent,
            "status": "success"
        }

    except Exception as e:
        return {"error": f"Gagal memproses AI: {str(e)}"}
    
@app.get("/api/approval-logs")
async def get_approval_logs():
    try:
        conn = get_db_connection()
        if not conn:
            return {"error": "Koneksi database gagal."}
            
        cur = conn.cursor()
        # Mengambil data log yang statusnya masih Pending, diurutkan dari yang terbaru
        cur.execute("""
            SELECT id, action_type, division, status, payload, ai_reasoning, created_at 
            FROM action_approvals 
            WHERE status = 'Pending'
            ORDER BY created_at DESC
        """)
        
        # Mengambil semua baris hasil query
        rows = cur.fetchall()
        
        # Merakit data ke dalam format list of dictionary (JSON friendly)
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
        
        # Eksekusi perintah UPDATE ke tabel action_approvals
        # Ini akan mengubah status "Pending" menjadi "Approved" atau "Rejected"
        update_query = "UPDATE action_approvals SET status = %s WHERE id = %s"
        cur.execute(update_query, (action.status, log_id))
        conn.commit()
        
        # Mengecek apakah benar-benar ada baris yang terupdate
        row_count = cur.rowcount
        
        cur.close()
        conn.close()
        
        if row_count == 0:
            # Jika ID tidak ditemukan
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
        # Mengambil data log yang statusnya Approved atau Rejected
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
        # Mencoba membuka koneksi ke PostgreSQL
        conn = get_db_connection()
        if conn:
            cur = conn.cursor()
            # Mengeksekusi perintah SQL sederhana untuk meminta versi Postgres
            cur.execute("SELECT version();")
            db_version = cur.fetchone()
            
            # Tutup koneksi agar tidak bocor
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

# --- ENDPOINT DEBUGGING ---
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