import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sentiment = searchParams.get('sentiment');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const adId = searchParams.get('adId');

  const where: Record<string, unknown> = {
    organizationId: session.organizationId,
  };

  if (sentiment && sentiment !== 'ALL') where.sentiment = sentiment;
  if (category && category !== 'ALL') where.category = category;
  if (status && status !== 'ALL') where.status = status;
  if (adId) where.adId = adId;

  const comments = await prisma.comment.findMany({
    where,
    include: {
      ad: { select: { id: true, name: true, metaAdId: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: comments, count: comments.length });
}
