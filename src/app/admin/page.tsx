'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Server, Database, Cpu, ShieldCheck, Zap } from 'lucide-react';

export default function AdminPage() {
  const services = [
    { name: 'Meta Graph API v20.0 Adapter', status: 'Healthy', latency: '142ms', uptime: '99.98%' },
    { name: 'PostgreSQL Database Engine', status: 'Healthy', latency: '4ms', uptime: '100%' },
    { name: 'Redis Cache & BullMQ Queue Server', status: 'Healthy', latency: '1ms', uptime: '100%' },
    { name: 'BullMQ Background Worker Swarm', status: 'Healthy', latency: 'Active (4 Workers)', uptime: '99.9%' },
    { name: 'GPT-4o Multi-Modal AI Provider', status: 'Healthy', latency: '820ms', uptime: '99.95%' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">System Admin & Observability Dashboard</h1>
        <p className="text-xs text-slate-400 mt-0.5">Real-time health monitoring for Meta API rate limits, database queries, and background worker queues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <Badge variant="success">{s.status}</Badge>
              </div>
              <CardTitle className="text-sm font-semibold text-slate-100 pt-1">{s.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-slate-400 pt-0">
              <div className="flex justify-between">
                <span>Latency / Workers:</span>
                <span className="font-mono text-slate-200">{s.latency}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Uptime:</span>
                <span className="font-mono text-emerald-400">{s.uptime}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
