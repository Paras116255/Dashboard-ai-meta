'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Plus, Play, Pause, CheckCircle2, Zap, AlertTriangle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AutomationPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [metricType, setMetricType] = useState('SPEND');
  const [thresholdValue, setThresholdValue] = useState('5000');
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const res = await fetch('/api/automation/rules');
      const json = await res.json();
      return json.data || [];
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      setShowModal(false);
      setSafetyConfirmed(false);
      setRuleName('');
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });

  const triggerRunMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/automation/run', { method: 'POST' });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-rules'] }),
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Budget Automation Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">Automated safety guards that automatically pause ad spending when configured limits are reached.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerRunMutation.mutate()}
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Evaluate Rules Now
          </Button>
          <Button size="sm" onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-500 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Protection Rule
          </Button>
        </div>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule: any) => (
          <Card key={rule.id} className="hover:border-slate-700 transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={rule.isEnabled ? 'success' : 'outline'}>
                  {rule.isEnabled ? 'GUARD ACTIVE' : 'DISABLED'}
                </Badge>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> Cooldown {rule.cooldownMinutes}m
                </span>
              </div>
              <CardTitle className="text-base leading-snug">{rule.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Metric Condition:</span>
                  <span className="font-semibold text-slate-200">{rule.metricType} &gt;= {rule.metricType === 'SPEND' ? `₹${rule.thresholdValue / 100}` : rule.thresholdValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Action:</span>
                  <span className="font-semibold text-amber-400">{rule.action}</span>
                </div>
              </div>

              {rule.executions && rule.executions.length > 0 && (
                <div className="text-[11px] text-slate-400 pt-1">
                  <span className="font-semibold text-slate-300 block mb-1">Recent Execution Log:</span>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-slate-400 italic">
                    "{rule.executions[0].triggeredBy}" ({new Date(rule.executions[0].executedAt).toLocaleTimeString()})
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Rule Modal with Explicit Opt-in Confirmation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">New Budget Safety Rule</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stop ad if spend >= ₹10,000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none mt-1"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Metric</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none mt-1"
                    value={metricType}
                    onChange={(e) => setMetricType(e.target.value)}
                  >
                    <option value="SPEND">Daily Spend (INR)</option>
                    <option value="ROAS">ROAS (Below Limit)</option>
                    <option value="CTR">CTR (Below %)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium">Threshold Value</label>
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none mt-1"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                  />
                </div>
              </div>

              {/* Explicit Safety Opt-in Box (Prompt Section 61) */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">
                    Important: Automated actions alter live Meta ad state. Please verify your threshold.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={safetyConfirmed}
                    onChange={(e) => setSafetyConfirmed(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-blue-600"
                  />
                  <span>"I understand this automation can pause my ads automatically."</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                size="sm"
                disabled={!safetyConfirmed || !ruleName}
                className="bg-blue-600 hover:bg-blue-500 text-xs disabled:opacity-50"
                onClick={() =>
                  createRuleMutation.mutate({
                    name: ruleName,
                    metricType,
                    thresholdValue: metricType === 'SPEND' ? Number(thresholdValue) * 100 : Number(thresholdValue),
                    action: 'PAUSE_AD',
                  })
                }
              >
                Create Protection Guard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
