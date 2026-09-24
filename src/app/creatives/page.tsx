'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Video, Image as ImageIcon } from 'lucide-react';

export default function CreativesPage() {
  const creatives = [
    {
      id: 'cr_1',
      name: 'Rainproof Test - 10L Expandable Backpack',
      title: 'Never Worry About Rain Again 🎒🌧️',
      format: 'VIDEO',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      cta: 'SHOP_NOW',
    },
    {
      id: 'cr_2',
      name: 'Unboxing UGC Reel - Travel Must-Haves',
      title: 'Fits 3 Days of Clothes in a Carry-on Size!',
      format: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800',
      cta: 'GET_OFFER',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Creative Asset Library</h1>
        <p className="text-xs text-slate-400 mt-0.5">High converting UGC videos, carousel images, and story scripts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creatives.map((cr) => (
          <Card key={cr.id} className="overflow-hidden group">
            <div className="relative h-48 w-full overflow-hidden bg-slate-950">
              <img src={cr.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              <Badge className="absolute top-3 left-3 bg-black/70 backdrop-blur border-slate-700 text-slate-200">
                {cr.format === 'VIDEO' ? <Video className="w-3 h-3 mr-1 text-blue-400" /> : <ImageIcon className="w-3 h-3 mr-1 text-indigo-400" />}
                {cr.format}
              </Badge>
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm line-clamp-1">{cr.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <p className="text-xs text-slate-300 line-clamp-2">{cr.title}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                <span>CTA: {cr.cta}</span>
                <span className="text-emerald-400 font-medium">Meta Approved ✓</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
