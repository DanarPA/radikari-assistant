# Radikari OS - AI Assistant Dashboard

Project ini adalah dashboard internal **Radikari** yang menggabungkan performa cepat dari **Vite + React** serta sistem komponen UI modern dari **Next.js** (Shadcn/UI & Radix UI). 

Dashboard ini dirancang untuk mengelola berbagai divisi perusahaan dengan sistem hak akses yang ketat dan antarmuka yang intuitif.

---

## 🚀 Tech Stack

Dashboard ini menggunakan teknologi terbaru untuk memastikan kecepatan pengembangan dan performa runtime:

* **Framework:** React 19 (Vite)
* **Styling:** Tailwind CSS 4.0
* **Components:** Radix UI, Lucide React, Shadcn/UI
* **Animations:** Tailwind Animate & Framer Motion (Ready)
* **Language:** JavaScript (JSX) & TypeScript (TSX) Hybrid

---

## 🛠️ Fitur & Implementasi

### 1. Role-Based Access Control (RBAC)
Sistem navigasi otomatis menyaring menu berdasarkan peran pengguna (`userRole`).
* **Super Admin:** Akses penuh ke semua divisi.
* **HR:** Akses ke HR Division & Dashboard.
* **Finance:** Akses ke Finance Division & Dashboard.
* **Marketing:** Akses ke Marketing Division & Dashboard.

### 2. Sidebar Policy & Logic
Menu sidebar dilengkapi dengan kebijakan akses. Jika user login sebagai divisi HR, maka menu Finance dan Marketing akan disembunyikan secara otomatis untuk menjaga keamanan data.

### 3. Center Approval System
Fitur sub-menu dinamis yang hanya muncul pada divisi tertentu saat menu tersebut aktif, memberikan alur kerja yang lebih rapi untuk proses persetujuan (approval).

### 4. User Header & Profile
Dropdown profile yang mencakup informasi login user, email perusahaan, dan fitur logout yang sudah terintegrasi.

---