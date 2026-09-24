import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (country && country !== 'ALL') where.country = country;
  if (category && category !== 'ALL') where.category = category;
  if (search) where.name = { contains: search };

  const products = await prisma.trendProduct.findMany({
    where,
    include: {
      trendAds: true,
    },
    orderBy: { trendScore: 'desc' },
  });

  return NextResponse.json({ success: true, data: products });
}
