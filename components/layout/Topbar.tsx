'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, LogOut, Settings, User } from 'lucide-react';

interface TopbarProps {
  fullName?: string;
  companyName?: string;
}

export function Topbar({ fullName, companyName }: TopbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header className="topbar">
      {/* Hamburger placeholder for mobile — actual nav is bottom */}
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
          style={{ background: 'linear-gradient(145deg,#2b3236,#1f2528)' }}>
          PP
        </div>
        <div>
          <div className="text-[19px] font-black tracking-tight leading-none">
            Paint<span style={{ color: '#d2ad76' }}>Pro</span>
          </div>
          <div className="text-[9px] text-[#aeb5b8] uppercase tracking-widest mt-0.5 hidden sm:block">
            Premium Painter Workspace
          </div>
        </div>
      </Link>

      {/* Global Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[600px] relative hidden sm:block">
        <input
          type="search"
          placeholder="Search product, brand or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 border border-white/20 rounded-2xl bg-white/5 text-white placeholder-[#aeb7ba] pl-4 pr-12 outline-none focus:border-[#d2ad76]/60 focus:bg-white/10 transition-all"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d6bd96]">
          <Search size={18} />
        </button>
      </form>

      {/* Right: user avatar */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <div className="text-sm font-bold leading-tight">{fullName || 'Painter'}</div>
          <div className="text-[10px] text-[#aeb5b8]">{companyName || 'Workspace'}</div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
            style={{ background: 'linear-gradient(145deg,#d2ad76,#b78b45)' }}
            aria-label="Profile menu"
          >
            {(fullName?.[0] || 'P').toUpperCase()}
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-48 bg-white border border-[#e5e1da] rounded-2xl shadow-premium z-50 py-2 overflow-hidden">
              <Link
                href="/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#666d71] hover:bg-[#f8f6f2] transition-colors"
              >
                <Settings size={14} /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
