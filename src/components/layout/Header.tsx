'use client';

import { Search, Bell, CheckCircle2, ChevronDown, User } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 ml-0 md:ml-64">
      {/* Left: Organization & Ad Account Selectors */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-medium cursor-pointer hover:bg-slate-800/60 transition">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>AdPilot Growth Agency</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ad Account: act_994021... (INR)</span>
        </div>
      </div>

      {/* Right: Search, Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Search trigger */}
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">Ctrl+K</kbd>
        </button>

        {/* Notifications Icon */}
        <Link href="/notifications" className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg relative transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-950" />
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">Paras Sharma</div>
            <div className="text-[10px] text-slate-400">Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
}
