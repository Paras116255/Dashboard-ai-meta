'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function AdSetsPage() {
  const { data: adSets = [] } = useQuery({
    queryKey: ['ad-sets-list'],
    queryFn: async () => {
      const res = await fetch('/api/ad-sets');
      const json = await res.json();
      return json.data || [];
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Meta Ad Sets</h1>
        <p className="text-xs text-slate-400 mt-0.5">Audience targeting, placement preferences, and budget schedule.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adSets.map((set: any) => (
          <Card key={set.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={set.status === 'ACTIVE' ? 'success' : 'warning'}>{set.status}</Badge>
                <span className="text-xs text-slate-400">{set.campaign?.name}</span>
              </div>
              <CardTitle className="text-base">{set.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Spend</span>
                  <span className="font-bold text-slate-100">{formatCurrency(set.spend)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Clicks</span>
                  <span className="font-semibold text-slate-200">{formatNumber(set.clicks)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ROAS</span>
                  <span className="font-bold text-emerald-400">{set.roas}x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
