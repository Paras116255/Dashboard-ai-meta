import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {
    organizationId: session.organizationId,
  };

  if (campaignId) where.campaignId = campaignId;
  if (status && status !== 'ALL') where.status = status;
  if (search) {
    where.name = { contains: search };
  }

  const ads = await prisma.ad.findMany({
    where,
    include: {
      campaign: { select: { name: true } },
      adSet: { select: { name: true } },
      creative: true,
      automationRules: { select: { id: true, name: true, isEnabled: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: ads, count: ads.length });
}
