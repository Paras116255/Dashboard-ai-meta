import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getMetaProvider } from '@/lib/meta';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const ad = await prisma.ad.findUnique({ where: { id: params.id } });
  if (!ad || ad.organizationId !== session.organizationId) {
    return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
  }

  const metaProvider = getMetaProvider();
  const metaRes = await metaProvider.resumeAd(ad.metaAdId);

  if (!metaRes.success) {
    return NextResponse.json({ success: false, error: metaRes.error }, { status: 400 });
  }

  const updated = await prisma.ad.update({
    where: { id: params.id },
    data: { status: 'ACTIVE', effectiveStatus: 'ACTIVE', lastSyncedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      userName: session.email,
      action: 'RESUME_AD',
      objectType: 'AD',
      objectId: ad.id,
      details: JSON.stringify({ metaAdId: ad.metaAdId }),
      result: 'SUCCESS',
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
