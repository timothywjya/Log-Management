"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function SearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
        <Search size={16} />
      </div>
      <input
        type="text"
        placeholder="Cari nama program..."
        onChange={(e: any) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
        style={{
          width: '100%',
          height: '44px',
          paddingLeft: '40px',
          paddingRight: '16px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#1e293b',
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '14px',
          outline: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#1db495';
          e.target.style.boxShadow = '0 0 0 3px rgba(29,180,149,0.15)';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#e2e8f0';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        }}
      />
    </div>
  );
}
