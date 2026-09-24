import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CommandPalette } from '@/components/layout/CommandPalette';

export const metadata: Metadata = {
  title: 'AdPilot AI - Production Meta Operating System',
  description: 'Manage Meta ads, comment monitoring, budget automation & AI ad intelligence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 max-w-7xl">
                {children}
              </main>
            </div>
          </div>
          <CommandPalette />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
