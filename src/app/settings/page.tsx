'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Key, RefreshCw, UserCheck, Zap, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(true);

  const handleConnectMeta = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setConnected(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Settings & Meta Integrations</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage Meta OAuth connections, access token encryption keys, organization seats, and RBAC permissions.</p>
      </div>

      {/* Meta OAuth Connection Wizard */}
      <Card className="border-blue-900/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">f</div>
              <div>
                <CardTitle className="text-base">Meta Business Manager Integration</CardTitle>
                <CardDescription className="text-xs">Connect Meta Ads Graph API v20.0 with AES-256 encrypted token storage</CardDescription>
              </div>
            </div>
            {connected ? (
              <Badge variant="success" className="gap-1.5 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED & SYNCED
              </Badge>
            ) : (
              <Badge variant="outline">DISCONNECTED</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Connected Business</span>
                <span className="font-semibold text-slate-200">AdPilot Global Ecom Manager</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ad Account</span>
                <span className="font-semibold text-slate-200">act_994021049281 (INR)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Token Security</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> AES-256 Encrypted
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Permissions Granted: ads_management, pages_read_engagement, pages_manage_engagement</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectMeta}
              className="border-slate-800 bg-slate-900 text-xs"
            >
              {isConnecting ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
              Reconnect Meta OAuth
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members & Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization Members & RBAC Roles</CardTitle>
          <CardDescription className="text-xs">Granular permission control (OWNER, ADMIN, MANAGER, ANALYST, VIEWER)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">PS</div>
              <div>
                <div className="font-semibold text-slate-100">Paras Sharma (paras@adpilot.ai)</div>
                <div className="text-slate-500 text-[10px]">Owner • Full Access</div>
              </div>
            </div>
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">OWNER</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
