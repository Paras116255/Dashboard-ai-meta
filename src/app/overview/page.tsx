'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  DollarSign,
  Eye,
  MousePointerClick,
  Award,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default function OverviewPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['overview-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      return json.data;
    },
  });

  const metrics = data?.metrics || {
    totalSpend: 14475000,
    totalImpressions: 700000,
    totalClicks: 21900,
    totalConversions: 609,
    avgCTR: '3.12',
    avgROAS: '3.65',
    activeAdsCount: 12,
  };

  const timeSeries = data?.timeSeries || [];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 p-6 rounded-2xl border border-blue-900/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Live Meta Sync Active
            </span>
            <span className="text-xs text-slate-400">Updated 2 minutes ago</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Good morning, Paras 👋</h1>
          <p className="text-sm text-slate-400 mt-1">Here is how your Meta ad campaigns and AI automations are performing today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-slate-700 bg-slate-900/60 hover:bg-slate-800">
            <RefreshCw className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Sync Now
          </Button>
          <Link href="/ai-studio">
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              New AI Ad Concept
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Ad Spend</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{formatCurrency(metrics.totalSpend)}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% vs last 7 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average ROAS</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{metrics.avgROAS}x</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Target 3.0x exceeded</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Conversions</CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{formatNumber(metrics.totalConversions)}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+8.4% purchase volume</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average CTR</CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{metrics.avgCTR}%</div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <span>21.9k Total Clicks</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Section */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daily Spend & ROAS Velocity</CardTitle>
            <CardDescription>Real-time campaign scaling breakdown for past 7 days</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">Daily View</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" name="Spend (INR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid: Live Automation Alerts & Trend Teasers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Guard Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <CardTitle className="text-base">Budget Protection Guard</CardTitle>
            </div>
            <Link href="/automation" className="text-xs text-blue-400 hover:underline">Manage Rules →</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-400">Auto-Pause Triggered (4h ago)</span>
                <p className="text-xs text-slate-300 mt-0.5">Paused "Old Static Banner" as spend reached ₹18,500 with low ROAS (1.15).</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">PAUSED</Badge>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Active Rule: Stop when Spend &gt;= ₹5,000 with ROAS &lt; 1.5</span>
              <span className="text-emerald-400 font-medium">Monitoring 12 Ads</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Studio Fast Track */}
        <Card className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/40 border-indigo-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              <CardTitle className="text-base">AI Ad Studio Quick Action</CardTitle>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">GPT-4o Engine</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-300">
              Describe your product to generate instant Meta ad hooks, primary text variations, UGC story scripts, and compliance-checked copy.
            </p>
            <div className="flex items-center gap-2">
              <Link href="/ai-studio" className="w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2">
                  Launch Studio Wizard →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
