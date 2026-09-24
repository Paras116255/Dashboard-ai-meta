'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  Trash2,
  Edit,
  Filter,
  Search,
  ExternalLink,
  Plus,
  AlertCircle,
  Download,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default function AdsManagerPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingAd, setEditingAd] = useState<any>(null);
  const [newBudget, setNewBudget] = useState<string>('');
  const [capabilityError, setCapabilityError] = useState<any>(null);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['ads-list', statusFilter, searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/ads?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      return json.data || [];
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async (adId: string) => {
      const res = await fetch(`/api/ads/${adId}/pause`, { method: 'POST' });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads-list'] }),
  });

  const resumeMutation = useMutation({
    mutationFn: async (adId: string) => {
      const res = await fetch(`/api/ads/${adId}/resume`, { method: 'POST' });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads-list'] }),
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ adId, budgetINR }: { adId: string; budgetINR: number }) => {
      const res = await fetch(`/api/ads/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyBudgetMinor: budgetINR * 100 }),
      });
      return res.json();
    },
    onSuccess: () => {
      setEditingAd(null);
      queryClient.invalidateQueries({ queryKey: ['ads-list'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (adId: string) => {
      const res = await fetch(`/api/ads/${adId}/delete`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success && json.requiresManualAction) {
        setCapabilityError(json);
      }
      return json;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['ads-list'] });
      }
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Meta Ads Manager</h1>
          <p className="text-xs text-slate-400 mt-0.5">Control live campaign budgets, creative previews, and auto-pause safety status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv = 'Ad Name,Status,Spend,Impressions,Clicks,CTR,ROAS\n' +
                ads.map((a: any) => `"${a.name}",${a.status},${a.spend / 100},${a.impressions},${a.clicks},${a.ctr},${a.roas}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `adpilot-ads-report-${Date.now()}.csv`;
              a.click();
            }}
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Export CSV
          </Button>
          <Link href="/ai-studio">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Ad
            </Button>
          </Link>
        </div>
      </div>

      {/* Capability Warning Modal if manual Meta Ads Manager action is required */}
      {capabilityError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-400">Manual Meta Action Required</h4>
            <p className="text-xs text-slate-300 mt-1">{capabilityError.error}</p>
            {capabilityError.manualActionUrl && (
              <a
                href={capabilityError.manualActionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 font-medium hover:underline mt-2"
              >
                Open in Meta Ads Manager <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button onClick={() => setCapabilityError(null)} className="text-xs text-slate-500 hover:text-slate-300">✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search ads by name..."
            className="bg-transparent border-none outline-none w-full text-xs text-slate-100 placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'ACTIVE', 'PAUSED', 'IN_REVIEW'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Ad Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Daily Budget</th>
                <th className="p-4">Spend</th>
                <th className="p-4">Impressions</th>
                <th className="p-4">Clicks</th>
                <th className="p-4">CTR</th>
                <th className="p-4">ROAS</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">Loading live Meta ads...</td>
                </tr>
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">No active ads found matching filter.</td>
                </tr>
              ) : (
                ads.map((ad: any) => (
                  <tr key={ad.id} className="hover:bg-slate-900/40 transition group">
                    <td className="p-4 font-medium text-slate-100 flex items-center gap-3">
                      {ad.creative?.imageUrl && (
                        <img src={ad.creative.imageUrl} alt="" className="w-9 h-9 rounded object-cover border border-slate-800" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition">{ad.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{ad.campaign?.name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {ad.status === 'ACTIVE' ? (
                        <Badge variant="success" className="gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </Badge>
                      ) : ad.status === 'PAUSED' ? (
                        <Badge variant="warning">PAUSED</Badge>
                      ) : (
                        <Badge variant="outline">{ad.status}</Badge>
                      )}
                    </td>
                    <td className="p-4 text-slate-200 font-mono">
                      {formatCurrency(ad.dailyBudget)}/day
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-100">
                      {formatCurrency(ad.spend)}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{formatNumber(ad.impressions)}</td>
                    <td className="p-4 text-slate-400 font-mono">{formatNumber(ad.clicks)}</td>
                    <td className="p-4 text-slate-300 font-mono">{ad.ctr}%</td>
                    <td className="p-4 font-bold text-emerald-400 font-mono">{ad.roas}x</td>
                    <td className="p-4 text-right space-x-1">
                      {ad.status === 'ACTIVE' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => pauseMutation.mutate(ad.id)}
                          title="Pause Ad"
                          className="hover:bg-amber-500/20 text-amber-400"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => resumeMutation.mutate(ad.id)}
                          title="Resume Ad"
                          className="hover:bg-emerald-500/20 text-emerald-400"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingAd(ad);
                          setNewBudget((ad.dailyBudget / 100).toString());
                        }}
                        title="Edit Budget"
                        className="hover:bg-slate-800 text-slate-400"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(ad.id)}
                        title="Delete Ad"
                        className="hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Edit Budget Dialog */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Edit Daily Budget</h3>
            <p className="text-xs text-slate-400">Change budget for "{editingAd.name}". Changes apply via Meta Graph API.</p>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">New Daily Budget (INR)</label>
              <input
                type="number"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditingAd(null)}>Cancel</Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500"
                onClick={() => updateBudgetMutation.mutate({ adId: editingAd.id, budgetINR: Number(newBudget) })}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
