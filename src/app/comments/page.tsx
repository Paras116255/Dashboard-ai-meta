'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, EyeOff, Trash2, Send, Sparkles, ThumbsUp, ShoppingBag, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CommentsPage() {
  const queryClient = useQueryClient();
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeReply, setActiveReply] = useState<{ id: string; text: string } | null>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments-list', sentimentFilter, categoryFilter],
    queryFn: async () => {
      const res = await fetch(`/api/comments?sentiment=${sentimentFilter}&category=${categoryFilter}`);
      const json = await res.json();
      return json.data || [];
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ commentId, replyMessage }: { commentId: string; replyMessage: string }) => {
      const res = await fetch(`/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage }),
      });
      return res.json();
    },
    onSuccess: () => {
      setActiveReply(null);
      queryClient.invalidateQueries({ queryKey: ['comments-list'] });
    },
  });

  const hideMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/comments/${commentId}/hide`, { method: 'POST' });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments-list'] }),
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">AI Comment Intelligence</h1>
        <p className="text-xs text-slate-400 mt-0.5">Centralized Meta comment monitoring with AI purchase-intent detection and suggested responses.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium mr-1">Category:</span>
          {['ALL', 'PURCHASE_INTENT', 'QUESTION', 'COMPLAINT', 'SPAM'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sentiment:</span>
          {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setSentimentFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                sentimentFilter === st
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card><CardContent className="p-8 text-center text-slate-500">Loading comments...</CardContent></Card>
        ) : comments.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-slate-500">No comments found matching current filter.</CardContent></Card>
        ) : (
          comments.map((cmt: any) => (
            <Card key={cmt.id} className="hover:border-slate-700 transition">
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={cmt.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="" className="w-8 h-8 rounded-full border border-slate-700" />
                    <div>
                      <div className="font-semibold text-slate-100 text-xs">{cmt.authorName}</div>
                      <div className="text-[11px] text-slate-500">On ad: {cmt.ad?.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmt.purchaseIntent === 'HIGH' && (
                      <Badge variant="success" className="gap-1 text-[10px]">
                        <ShoppingBag className="w-3 h-3" /> HIGH PURCHASE INTENT
                      </Badge>
                    )}
                    <Badge variant={cmt.sentiment === 'POSITIVE' ? 'success' : cmt.sentiment === 'NEGATIVE' ? 'destructive' : 'outline'}>
                      {cmt.sentiment}
                    </Badge>
                    <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
                      {cmt.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-sans">{cmt.text}</p>

                {/* AI Suggested Reply Box */}
                {cmt.replyText && (
                  <div className="bg-blue-950/40 border border-blue-900/40 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Suggested Response ({cmt.status === 'REPLIED' ? 'Published' : 'Pending Approval'}):</span>
                    </div>
                    <p className="text-slate-300 italic">"{cmt.replyText}"</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveReply({ id: cmt.id, text: cmt.replyText || '' })}
                      className="h-8 border-slate-800 bg-slate-900 hover:bg-slate-800 text-blue-400"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Reply / Approve AI
                    </Button>
                    {!cmt.isHidden && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => hideMutation.mutate(cmt.id)}
                        className="h-8 text-amber-400 hover:bg-amber-500/10"
                      >
                        <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                        Hide on Meta
                      </Button>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(cmt.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Reply Drawer / Input */}
                {activeReply?.id === cmt.id && activeReply && (
                  <div className="pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                      value={activeReply.text}
                      onChange={(e) => setActiveReply(prev => prev ? { ...prev, text: e.target.value } : null)}
                      placeholder="Type official reply to post on Meta..."
                    />
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-xs"
                      onClick={() => replyMutation.mutate({ commentId: cmt.id, replyMessage: activeReply.text })}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Send
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
