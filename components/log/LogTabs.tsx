import { CATEGORY_META, LOG_CATEGORIES, type LogCategory } from "@/lib/log-category";
import { CalendarClock, Globe, Laptop, Smartphone } from "lucide-react";
import Link from "next/link";

const ICONS = {
  web: Globe,
  job: CalendarClock,
  desktop: Laptop,
  mobile: Smartphone,
} as const;

export default function LogTabs({ active }: { active: LogCategory }) {
  return (
    <nav className="flex flex-wrap gap-2 mb-6" aria-label="Kategori log">
      {LOG_CATEGORIES.map((c) => {
        const Icon = ICONS[c];
        const isActive = c === active;
        return (
          <Link
            key={c}
            href={`/log/${c}`}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
              isActive
                ? "bg-[#1db495] text-white shadow-lg shadow-[#1db495]/20"
                : "bg-white text-slate-500 border border-slate-200 hover:text-[#1db495] hover:border-[#1db495]/40"
            }`}
          >
            <Icon size={16} />
            {CATEGORY_META[c].label}
          </Link>
        );
      })}
    </nav>
  );
}
