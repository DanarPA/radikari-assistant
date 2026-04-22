import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-10 transition-colors duration-300">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Radikari Assistant
        </h1>
        
        {/* Tombol Toggle diletakkan di sini */}
        <ThemeToggle />
      </div>

      <div className="mt-10 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <p className="text-slate-600 dark:text-slate-400">
          Coba klik tombol di pojok kanan atas untuk melihat perubahan tema!
        </p>
      </div>
    </main>
  )
}