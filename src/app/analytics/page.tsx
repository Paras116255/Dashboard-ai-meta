'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Globe, Smartphone, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AnalyticsPage() {
  const data = [
    { country: 'United States', spend: 64200, roas: 3.85, conversions: 260 },
    { country: 'India', spend: 30050, roas: 3.15, conversions: 122 },
    { country: 'Germany', spend: 18500, roas: 4.10, conversions: 88 },
    { country: 'United Kingdom', spend: 14200, roas: 3.40, conversions: 65 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Performance Analytics & Creative Breakdown</h1>
        <p className="text-xs text-slate-400 mt-0.5">Granular performance metrics by country, platform, age/gender, placement, and creative angle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Regional Spend & Conversion Performance</CardTitle>
            <CardDescription>Breakdown by country targeting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="country" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Spend (INR)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Creative Category Comparison</CardTitle>
            <CardDescription>ROAS comparison across creative visual formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { format: 'UGC Video Shower Test', roas: '3.85x', ctr: '3.09%', spend: '₹42,000' },
              { format: 'Carousel Feature Breakdown', roas: '3.02x', ctr: '2.54%', spend: '₹22,200' },
              { format: 'Unboxing Story Reel', roas: '4.85x', ctr: '5.00%', spend: '₹32,000' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <div>
                  <div className="font-semibold text-slate-100">{c.format}</div>
                  <div className="text-slate-500 mt-0.5">Spend {c.spend} • CTR {c.ctr}</div>
                </div>
                <Badge variant="success" className="font-bold text-xs">{c.roas}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
