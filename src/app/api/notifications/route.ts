import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: notifications });
}

export async function PATCH(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { organizationId: session.organizationId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true, message: 'All notifications marked as read' });
}
