"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Pastikan komponen sudah terpasang (mounted) di client
  // Ini untuk mencegah error hydration di Next.js
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="p-2 h-9 w-9" /> // Placeholder kosong agar layout tidak melompat
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative inline-flex p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
      aria-label="Toggle theme"
    >
      {/* Ikon Matahari (Tampil hanya di mode light) */}
      <Sun className="h-5 w-5 text-amber-500 transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
      
      {/* Ikon Bulan (Tampil hanya di mode dark) */}
      <Moon className="absolute h-5 w-5 text-blue-400 transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
    </button>
  )
}