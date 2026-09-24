'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, Pause, Sparkles, TrendingUp, MessageSquare, ShieldAlert, Settings } from 'lucide-react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = Router();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const commands = [
    { title: 'Overview Dashboard', category: 'Navigation', icon: Search, href: '/overview' },
    { title: 'Ads Manager', category: 'Navigation', icon: Play, href: '/ads' },
    { title: 'AI Ad Studio - Create New Concept', category: 'AI', icon: Sparkles, href: '/ai-studio' },
    { title: 'Trend Intelligence Hub', category: 'Trends', icon: TrendingUp, href: '/trends' },
    { title: 'Unread Comments & Sentiment', category: 'Comments', icon: MessageSquare, href: '/comments' },
    { title: 'Automation Safety Rules', category: 'Automation', icon: ShieldAlert, href: '/automation' },
    { title: 'Settings & Meta Connections', category: 'Settings', icon: Settings, href: '/settings' },
  ].filter((c) => c.title.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm animate-in fade-in-0">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input
            type="text"
            className="w-full bg-transparent py-4 text-sm text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Type a command or search ads, products, rules... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-800 rounded border border-slate-700">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {commands.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">No matching command found.</div>
          ) : (
            commands.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(cmd.href);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-primary group-hover:scale-110 transition" />
                    <span className="text-sm font-medium text-slate-200">{cmd.title}</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">{cmd.category}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Router() {
  const router = useRouter();
  return router;
}
