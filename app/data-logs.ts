export const auditData = [
  { 
    id: "FIN-9012", 
    action: "Data Input Automation", 
    user: "System AI", 
    status: "Success", 
    time: "08:15 AM",
    request: "Otomasi input invoice vendor dari PDF ke sistem Finance (Radikari). Total 50 dokumen diproses.",
    aiResponse: "Invoice berhasil diekstraksi. Data nominal dan nomor rekening vendor sudah diverifikasi sesuai dengan database Finance.",
    category: "Finance"
  },
  { 
    id: "MKT-4432", 
    action: "Email Sorting", 
    user: "System AI", 
    status: "Success",
    time: "09:00 AM",
    request: "Menyortir 120 email repetitif. 85 email promo dipindahkan ke folder 'Arsip', 35 pertanyaan CS diteruskan ke Zendesk.",
    aiResponse: "Penyortiran selesai. Akurasi klasifikasi mencapai 98%. Email urgent telah ditandai dengan prioritas tinggi.",
    category: "Marketing & CS"
  },
  { 
    id: "LEG-2109", 
    action: "Contract Drafting", 
    user: "Admin", 
    status: "Pending", 
    time: "10:45 AM",
    request: "Pembuatan draft kontrak kerja sama vendor baru. AI mendeteksi 2 klausul risiko tinggi yang perlu review manual.",
    aiResponse: "Draft kontrak selesai dibuat. Perhatian: Klausul 'Force Majeure' dan 'Termination' memerlukan persetujuan legal manual.",
    category: "Legal & HR"
  },
  { 
    id: "LEG-2110", 
    action: "Contract Drafting", 
    user: "Admin", 
    status: "Pending", 
    time: "10:45 AM",
    request: "Pembuatan draft kontrak kerja sama vendor baru. AI mendeteksi 2 klausul risiko tinggi yang perlu review manual.",
    aiResponse: "Draft kontrak selesai dibuat. Perhatian: Klausul 'Force Majeure' dan 'Termination' memerlukan persetujuan legal manual.",
    category: "Legal & HR"
  }
  
];

// Menghitung data secara otomatis
export const statsOverview = [
  {
    title: "Total Logs",
    value: auditData.length.toString(),
    icon: "Activity",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    title: "Pending Approval",
    value: auditData.filter((log) => log.status === "Pending").length.toString(),
    icon: "Clock",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "System Health",
    value: "98.2%", // Ini bisa kamu ganti manual sesuai keinginan
    icon: "ShieldCheck",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];