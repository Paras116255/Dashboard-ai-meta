'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Megaphone, MessageSquare, TrendingUp, Wand2 } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navs = [
    { name: 'Home', href: '/overview', icon: LayoutDashboard },
    { name: 'Ads', href: '/ads', icon: Megaphone },
    { name: 'Comments', href: '/comments', icon: MessageSquare },
    { name: 'Trends', href: '/trends', icon: TrendingUp },
    { name: 'AI Studio', href: '/ai-studio', icon: Wand2 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg flex items-center justify-around py-2 px-1">
      {navs.map((n) => {
        const isActive = pathname.startsWith(n.href);
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{n.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
