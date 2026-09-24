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

  const { replyMessage } = await req.json();
  if (!replyMessage) {
    return NextResponse.json({ success: false, error: 'Reply message is required' }, { status: 400 });
  }

  const metaProvider = getMetaProvider();
  const metaRes = await metaProvider.replyComment(comment.metaCommentId, replyMessage);
  if (!metaRes.success) {
    return NextResponse.json({ success: false, error: metaRes.error }, { status: 400 });
  }

  const updated = await prisma.comment.update({
    where: { id: params.id },
    data: {
      replyText: replyMessage,
      repliedAt: new Date(),
      status: 'REPLIED',
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
