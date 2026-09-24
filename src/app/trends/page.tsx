'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Sparkles, ExternalLink, Flame, ShieldCheck, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrendsPage() {
  const router = useRouter();
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['trend-products', countryFilter, searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/trends/products?country=${countryFilter}&search=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      return json.data || [];
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-blue-950/60 p-6 rounded-2xl border border-purple-900/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Meta Ad Library Data</Badge>
            <span className="text-xs text-slate-400">Legally Sourced Public Signals</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Trend Intelligence Hub</h1>
          <p className="text-sm text-slate-400 mt-1">Discover explosive viral products, high-performing ad hooks, and creative positioning globally.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search viral products..."
            className="bg-transparent border-none outline-none w-full text-xs text-slate-100 placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Target Region:</span>
          {['ALL', 'US', 'IN', 'DE', 'UK'].map((c) => (
            <button
              key={c}
              onClick={() => setCountryFilter(c)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                countryFilter === c
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <Card className="col-span-full"><CardContent className="p-8 text-center text-slate-500">Loading trend signals...</CardContent></Card>
        ) : products.length === 0 ? (
          <Card className="col-span-full"><CardContent className="p-8 text-center text-slate-500">No trending products found.</CardContent></Card>
        ) : (
          products.map((tp: any) => (
            <Card key={tp.id} className="overflow-hidden hover:border-purple-900/60 transition group">
              <div className="grid grid-cols-1 sm:grid-cols-3">
                <div className="relative h-48 sm:h-full overflow-hidden bg-slate-950">
                  <img src={tp.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <Badge className="absolute top-3 left-3 bg-red-500/80 text-white font-bold text-[10px] gap-1">
                    <Flame className="w-3 h-3 fill-current" /> SCORE {tp.trendScore}
                  </Badge>
                </div>

                <div className="sm:col-span-2 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">{tp.category}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Region: {tp.country}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{tp.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Brand: {tp.brand} • {tp.adCount} Live Ads Detected</p>
                  </div>

                  {tp.trendAds && tp.trendAds.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                      <span className="font-semibold text-purple-300 block mb-0.5">AI Hook Analysis:</span>
                      <p className="text-slate-400 italic">"{tp.trendAds[0].hookAnalysis}"</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/ai-studio?product=${encodeURIComponent(tp.name)}&desc=${encodeURIComponent(tp.category)}`)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Create Similar Concept in AI Studio
                    </Button>
                    <a
                      href={tp.landingPageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
                      title="View Source Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
