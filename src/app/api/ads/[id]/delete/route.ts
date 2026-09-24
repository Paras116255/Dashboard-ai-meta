import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { checkMetaCapability, getMetaProvider } from '@/lib/meta';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const ad = await prisma.ad.findUnique({ where: { id: params.id } });
  if (!ad || ad.organizationId !== session.organizationId) {
    return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
  }

  const capability = checkMetaCapability('ad.delete');
  if (!capability.isSupported) {
    return NextResponse.json(
      {
        success: false,
        requiresManualAction: true,
        fallbackInstructions: capability.fallbackInstructions,
        manualActionUrl: `https://adsmanager.facebook.com/adsmanager/manage/ads?act=${ad.metaAdId}`,
        error: capability.note || 'Meta API restricts hard-deleting active published ads with impression history.',
      },
      { status: 400 }
    );
  }

  const metaProvider = getMetaProvider();
  const metaRes = await metaProvider.deleteAd(ad.metaAdId);
  if (!metaRes.success) {
    return NextResponse.json({ success: false, error: metaRes.error }, { status: 400 });
  }

  await prisma.ad.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true, message: 'Ad deleted successfully' });
}
