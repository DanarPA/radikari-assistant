import { Activity, Clock, ShieldCheck } from "lucide-react";

interface Stat {
  title: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
}

// Tambahkan default parameter { stats = [] } untuk mencegah error .map()
export function StatsCards({ stats = [] }: { stats?: Stat[] }) {
  // Jika stats kosong atau undefined, tampilkan placeholder agar UI tidak rusak
  if (!stats || stats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl border border-white/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => {
        // Logic pemilihan icon
        const Icon =
          stat.icon === "Activity"
            ? Activity
            : stat.icon === "Clock"
              ? Clock
              : ShieldCheck;

        return (
          <div
            key={index}
            className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-sm flex items-center gap-4 hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white">
                {stat.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;