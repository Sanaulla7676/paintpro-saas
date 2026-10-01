'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Star,
  BookOpen,
  Plus,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  ShoppingBag,
  Palette,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  group?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', group: 'Workspace' },
  { href: '/products', icon: <Package size={16} />, label: 'Products', group: 'Workspace' },
  { href: '/categories', icon: <ShoppingBag size={16} />, label: 'Categories', group: 'Workspace' },
  { href: '/shades', icon: <Palette size={16} />, label: 'Shade Finder', group: 'Workspace' },
  { href: '/quotations', icon: <FileText size={16} />, label: 'Quotations', group: 'Workspace' },
  { href: '/saved', icon: <Star size={16} />, label: 'Saved Products', group: 'Workspace' },
  { href: '/price-book', icon: <BookOpen size={16} />, label: 'Price Book', group: 'Controls' },
  { href: '/customers', icon: <Users size={16} />, label: 'Customers', group: 'Controls' },
  { href: '/settings', icon: <Settings size={16} />, label: 'Settings', group: 'Controls' },
];

interface SidebarProps {
  companyName?: string;
  fullName?: string;
}

export function Sidebar({ companyName, fullName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const groups = ['Workspace', 'Controls'];

  return (
    <aside className="hidden lg:flex flex-col w-62 bg-[#fbfaf8] border-r border-[#e5e1da] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
      <div className="flex-1 p-4 space-y-1">
        {groups.map((group) => (
          <div key={group}>
            <div className="text-[10px] uppercase tracking-widest text-[#a39b91] font-bold px-3 py-2 mt-3 first:mt-0">
              {group}
            </div>
            {navItems
              .filter((item) => item.group === group)
              .map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-sm font-semibold transition-all',
                      active
                        ? 'bg-[#1f2528] text-white shadow-soft'
                        : 'text-[#666d71] hover:bg-[#f0ece4]'
                    )}
                  >
                    <span className={cn(active ? 'text-[#d2ad76]' : 'text-[#92999c]')}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
          </div>
        ))}

        {/* New Quote shortcut */}
        <div className="mt-4 px-2">
          <Link
            href="/quotations/new"
            className="flex items-center gap-2 w-full px-3 py-3 rounded-2xl text-sm font-semibold text-[#666d71] hover:bg-[#f0ece4] transition-all"
          >
            <span className="text-[#92999c]"><Plus size={16} /></span>
            New Quote
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#e5e1da]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
            style={{ background: 'linear-gradient(145deg,#d2ad76,#b78b45)' }}>
            {(fullName?.[0] || companyName?.[0] || 'P').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate">{fullName || 'Painter'}</div>
            <div className="text-[10px] text-muted truncate">{companyName || 'Workspace'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-[#666d71] hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const mobileItems = [
    { href: '/dashboard', icon: <Home size={20} />, label: 'Home' },
    { href: '/products', icon: <Package size={20} />, label: 'Products' },
    { href: '/quotations', icon: <FileText size={20} />, label: 'Quotes' },
    { href: '/saved', icon: <Star size={20} />, label: 'Saved' },
  ];

  return (
    <nav className="mobile-nav lg:hidden">
      {mobileItems.map((item) => {
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('flex flex-col items-center gap-1 py-1', active ? 'active' : '')}
          >
            {item.icon}
            <span className="text-[9px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
