'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ShieldCheck, User, Clock } from 'lucide-react';

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs-list'],
    queryFn: async () => {
      const res = await fetch('/api/audit-logs');
      const json = await res.json();
      return json.data || [];
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Audit Logs & Governance</h1>
        <p className="text-xs text-slate-400 mt-0.5">Immutable activity record of budget changes, automated pauses, AI publishing, and Meta API actions.</p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Object</th>
                <th className="p-4">Details</th>
                <th className="p-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {isLoading ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">No logs found.</td></tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="p-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-sans font-semibold text-slate-200">{log.userName}</td>
                    <td className="p-4 font-bold text-blue-400">{log.action}</td>
                    <td className="p-4 text-slate-300">{log.objectType} ({log.objectId})</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{log.details}</td>
                    <td className="p-4">
                      <Badge variant="success" className="text-[10px]">{log.result}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
