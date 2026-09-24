'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      return json.data || [];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', { method: 'PATCH' });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-list'] }),
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Notifications Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Automated budget alerts, comment updates, and AI generation notices.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markReadMutation.mutate()} className="border-slate-800 bg-slate-900 text-xs">
          Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <Card><CardContent className="p-6 text-center text-slate-500">Loading notifications...</CardContent></Card>
        ) : notifications.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-slate-500">No notifications.</CardContent></Card>
        ) : (
          notifications.map((n: any) => (
            <Card key={n.id} className={!n.isRead ? 'border-blue-900/50 bg-blue-950/10' : ''}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-100">{n.title}</h4>
                    <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-300">{n.message}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
