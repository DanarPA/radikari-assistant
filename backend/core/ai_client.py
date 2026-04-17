import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Memastikan environment variables terbaca
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

def ask_deepseek(prompt_text, history=None):
    """
    Fungsi untuk mengirim prompt ke DeepSeek, menyertakan riwayat obrolan,
    dan memaksanya membalas dengan format JSON.
    """
    if history is None:
        history = []
        
    # Instruksi khusus agar AI mendeteksi niat user
    system_prompt = """
    Anda adalah asisten HR digital Radikari. Tugas Anda:
    1. Menjawab pertanyaan berdasarkan SOP.
    2. Mendeteksi jika user memberikan instruksi untuk melakukan tindakan (misal: "Buat draf kontrak", "Ajukan cuti", "Tolong bikinkan surat").

    Anda HARUS merespons HANYA dalam format JSON yang valid dengan struktur berikut:
    {
        "intent": "qa" (jika hanya tanya jawab) ATAU "action" (jika user meminta tindakan),
        "action_type": "nama_tindakan" (misal: "buat_kontrak" / null jika qa),
        "reply": "Jawaban profesional Anda untuk user berdasarkan SOP"
    }
    """

    # 1. Masukkan instruksi sistem sebagai pondasi
    messages_payload = [{"role": "system", "content": system_prompt}]
    
    # 2. Sisipkan riwayat obrolan sebelumnya agar AI ingat konteks
    for msg in history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if content:
            messages_payload.append({"role": role, "content": content})
        
    # 3. Masukkan pertanyaan/pesan terbaru user (yang sudah dirakit dengan SOP) di urutan terakhir
    messages_payload.append({"role": "user", "content": prompt_text})

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages_payload, # Menggunakan payload yang sudah dirakit lengkap
            temperature=0.1, # Dibuat sangat rendah agar format JSON tidak rusak
            response_format={"type": "json_object"} # FITUR KHUSUS: Memaksa DeepSeek mengeluarkan JSON murni
        )
        
        # Mengambil string JSON dari AI dan mengubahnya menjadi tipe data Dictionary di Python
        result_text = response.choices[0].message.content
        return json.loads(result_text)
        
    except json.JSONDecodeError:
        return {"intent": "error", "reply": "Maaf, terjadi kesalahan format dalam membaca respons AI."}
    except Exception as e:
        print(f"Error DeepSeek API: {e}")
        return {"intent": "error", "reply": "Maaf, sistem AI sedang mengalami kendala jaringan."}