import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.aIProject.findMany({
    where: { organizationId: session.organizationId },
    include: {
      generations: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: projects });
}

export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, targetCountry, targetAudience, language, objective, brandTone } = await req.json();

  const project = await prisma.aIProject.create({
    data: {
      organizationId: session.organizationId,
      name,
      description: description || '',
      targetCountry: targetCountry || 'US',
      targetAudience: targetAudience || 'Broad Adults',
      language: language || 'English',
      objective: objective || 'OUTCOME_SALES',
      brandTone: brandTone || 'Direct Response',
      status: 'DRAFT',
    },
  });

  return NextResponse.json({ success: true, data: project });
}
