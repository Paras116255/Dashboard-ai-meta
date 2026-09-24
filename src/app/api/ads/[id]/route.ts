import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getMetaProvider } from '@/lib/meta';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const ad = await prisma.ad.findUnique({
    where: { id: params.id },
    include: {
      campaign: true,
      adSet: true,
      creative: true,
      comments: { orderBy: { createdAt: 'desc' }, take: 10 },
      insights: { orderBy: { date: 'desc' }, take: 14 },
      automationRules: true,
      executions: { orderBy: { executedAt: 'desc' }, take: 5 },
    },
  });

  if (!ad || ad.organizationId !== session.organizationId) {
    return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: ad });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const ad = await prisma.ad.findUnique({ where: { id: params.id } });
  if (!ad || ad.organizationId !== session.organizationId) {
    return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
  }

  const { dailyBudgetMinor, headline, primaryText, name } = await req.json();

  const metaProvider = getMetaProvider();
  let metaResult;

  if (dailyBudgetMinor !== undefined) {
    metaResult = await metaProvider.updateAdBudget(ad.metaAdId, dailyBudgetMinor);
  } else if (headline || primaryText) {
    metaResult = await metaProvider.updateAdCopy(ad.metaAdId, headline || '', primaryText || '');
  }

  if (metaResult && !metaResult.success) {
    return NextResponse.json({ success: false, error: metaResult.error }, { status: 400 });
  }

  const updatedAd = await prisma.ad.update({
    where: { id: params.id },
    data: {
      dailyBudget: dailyBudgetMinor !== undefined ? dailyBudgetMinor : ad.dailyBudget,
      name: name || ad.name,
      lastSyncedAt: new Date(),
    },
  });

  // Log audit action
  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      userName: session.email,
      action: 'UPDATE_AD',
      objectType: 'AD',
      objectId: ad.id,
      details: JSON.stringify({
        oldBudget: ad.dailyBudget,
        newBudget: dailyBudgetMinor,
        metaAdId: ad.metaAdId,
      }),
      result: 'SUCCESS',
    },
  });

  return NextResponse.json({ success: true, data: updatedAd });
}
