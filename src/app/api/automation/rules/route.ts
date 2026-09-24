import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const rules = await prisma.automationRule.findMany({
    where: { organizationId: session.organizationId },
    include: {
      ad: { select: { id: true, name: true, metaAdId: true } },
      executions: { orderBy: { executedAt: 'desc' }, take: 5 },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: rules });
}

export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { name, adId, ruleType, metricType, condition, thresholdValue, action, cooldownMinutes } = await req.json();

  if (!name || thresholdValue === undefined) {
    return NextResponse.json({ success: false, error: 'Rule name and threshold value are required' }, { status: 400 });
  }

  const rule = await prisma.automationRule.create({
    data: {
      organizationId: session.organizationId,
      name,
      adId: adId || null,
      ruleType: ruleType || 'BUDGET_SPEND_THRESHOLD',
      metricType: metricType || 'SPEND',
      condition: condition || 'GREATER_THAN_EQUAL',
      thresholdValue: Number(thresholdValue),
      action: action || 'PAUSE_AD',
      cooldownMinutes: Number(cooldownMinutes) || 60,
      isEnabled: true,
    },
  });

  return NextResponse.json({ success: true, data: rule });
}
