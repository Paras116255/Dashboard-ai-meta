'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  FolderKanban,
  Layers,
  Sparkles,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  TrendingUp,
  Wand2,
  Bell,
  FileText,
  Settings,
  Shield,
  Zap,
} from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Ads Manager', href: '/ads', icon: Megaphone },
  { name: 'Campaigns', href: '/campaigns', icon: FolderKanban },
  { name: 'Ad Sets', href: '/ad-sets', icon: Layers },
  { name: 'Creatives', href: '/creatives', icon: Sparkles },
  { name: 'Comments AI', href: '/comments', icon: MessageSquare, badge: 'AI' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Automation', href: '/automation', icon: ShieldAlert },
  { name: 'Trend Intelligence', href: '/trends', icon: TrendingUp, badge: 'HOT' },
  { name: 'AI Ad Studio', href: '/ai-studio', icon: Wand2, badge: 'PRO' },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'System Admin', href: '/admin', icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800/80 text-slate-300 min-h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-base tracking-tight leading-none">AdPilot AI</h1>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Meta OS v1.0</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Meta Connection Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 m-3 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">Meta API Connected</span>
          </div>
          <span className="text-[10px] text-slate-400">v20.0</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Synced 2m ago</p>
      </div>
    </aside>
  );
}
