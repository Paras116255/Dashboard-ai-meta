import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const ads = await prisma.ad.findMany({
    where: { organizationId: session.organizationId },
  });

  const totalSpend = ads.reduce((acc, curr) => acc + curr.spend, 0);
  const totalImpressions = ads.reduce((acc, curr) => acc + curr.impressions, 0);
  const totalClicks = ads.reduce((acc, curr) => acc + curr.clicks, 0);
  const totalConversions = ads.reduce((acc, curr) => acc + curr.conversions, 0);
  const avgCTR = ads.length > 0 ? (ads.reduce((acc, curr) => acc + curr.ctr, 0) / ads.length).toFixed(2) : '0';
  const avgROAS = ads.length > 0 ? (ads.reduce((acc, curr) => acc + curr.roas, 0) / ads.length).toFixed(2) : '0';

  const timeSeries = [
    { date: '2026-09-17', spend: 12500, roas: 3.8, conversions: 45, clicks: 1800 },
    { date: '2026-09-18', spend: 14200, roas: 3.5, conversions: 52, clicks: 2100 },
    { date: '2026-09-19', spend: 15800, roas: 3.9, conversions: 61, clicks: 2450 },
    { date: '2026-09-20', spend: 16400, roas: 4.1, conversions: 68, clicks: 2680 },
    { date: '2026-09-21', spend: 17100, roas: 3.7, conversions: 59, clicks: 2510 },
    { date: '2026-09-22', spend: 18200, roas: 3.6, conversions: 64, clicks: 2790 },
    { date: '2026-09-23', spend: 19500, roas: 4.2, conversions: 78, clicks: 3100 },
  ];

  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        totalSpend,
        totalImpressions,
        totalClicks,
        totalConversions,
        avgCTR,
        avgROAS,
        activeAdsCount: ads.filter((a) => a.status === 'ACTIVE').length,
      },
      timeSeries,
    },
  });
}
