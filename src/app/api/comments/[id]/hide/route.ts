import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getMetaProvider } from '@/lib/meta';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment || comment.organizationId !== session.organizationId) {
    return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
  }

  const metaProvider = getMetaProvider();
  const metaRes = await metaProvider.hideComment(comment.metaCommentId);
  if (!metaRes.success) {
    return NextResponse.json({ success: false, error: metaRes.error }, { status: 400 });
  }

  const updated = await prisma.comment.update({
    where: { id: params.id },
    data: { isHidden: true, status: 'HIDDEN' },
  });

  return NextResponse.json({ success: true, data: updated });
}
