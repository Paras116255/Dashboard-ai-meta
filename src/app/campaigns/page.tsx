'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderKanban, Plus, Play, Pause, Layers } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns-list'],
    queryFn: async () => {
      const res = await fetch('/api/campaigns');
      const json = await res.json();
      return json.data || [];
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Meta Campaigns</h1>
          <p className="text-xs text-slate-400 mt-0.5">Top-level objective structure and Advantage+ budget allocation.</p>
        </div>
        <Link href="/ai-studio">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Campaign Concept
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((cmp: any) => (
          <Card key={cmp.id} className="hover:border-slate-700 transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={cmp.status === 'ACTIVE' ? 'success' : 'warning'}>{cmp.status}</Badge>
                <span className="text-xs text-slate-400 font-mono">{cmp.objective}</span>
              </div>
              <CardTitle className="text-base leading-snug">{cmp.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Total Spend</span>
                  <span className="font-bold text-slate-100">{formatCurrency(cmp.spend)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ROAS</span>
                  <span className="font-bold text-emerald-400">{cmp.roas}x</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Impressions</span>
                  <span className="text-slate-300">{formatNumber(cmp.impressions)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Ad Sets</span>
                  <span className="text-slate-300">{cmp.adSets?.length || 0} Sets</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                <span>Daily Budget: {formatCurrency(cmp.dailyBudget)}</span>
                <Link href="/ads" className="text-blue-400 hover:underline">View Ads →</Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
