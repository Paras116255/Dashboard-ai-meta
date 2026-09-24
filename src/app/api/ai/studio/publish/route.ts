import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getMetaProvider } from '@/lib/meta';

export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { generationId, userConfirmation, adAccountId, campaignId, adSetId } = await req.json();

  if (!userConfirmation) {
    return NextResponse.json(
      {
        success: false,
        error: 'Explicit user confirmation is required before publishing any AI generated ad to Meta.',
      },
      { status: 400 }
    );
  }

  const generation = await prisma.aIGeneration.findUnique({ where: { id: generationId } });
  if (!generation || generation.organizationId !== session.organizationId) {
    return NextResponse.json({ success: false, error: 'Generation record not found' }, { status: 404 });
  }

  const defaultAccount = await prisma.metaAdAccount.findFirst({
    where: { organizationId: session.organizationId },
  });
  const defaultCampaign = await prisma.campaign.findFirst({
    where: { organizationId: session.organizationId },
  });
  const defaultAdSet = await prisma.adSet.findFirst({
    where: { organizationId: session.organizationId },
  });

  const actId = adAccountId || defaultAccount?.metaAccountId || 'act_994021049281';
  const cmpId = campaignId || defaultCampaign?.metaCampaignId || '23851092830192';
  const setFilterId = adSetId || defaultAdSet?.metaAdSetId || '23851092830201';

  const metaProvider = getMetaProvider();
  const metaRes = await metaProvider.publishAd({
    adAccountId: actId,
    campaignId: cmpId,
    adSetId: setFilterId,
    name: `AI Published: ${generation.conceptName}`,
    headline: generation.headline,
    primaryText: generation.primaryText,
    callToAction: generation.callToAction,
    imageUrl: generation.imageUrl || undefined,
  });

  if (!metaRes.success) {
    return NextResponse.json({ success: false, error: metaRes.error }, { status: 400 });
  }

  const metaAdId = metaRes.data?.metaAdId || `meta_ai_${Date.now()}`;

  // Save published ad into local DB
  const dbAd = await prisma.ad.create({
    data: {
      organizationId: session.organizationId,
      adAccountId: defaultAccount?.id || '',
      campaignId: defaultCampaign?.id || '',
      adSetId: defaultAdSet?.id || '',
      metaAdId,
      name: `AI Published: ${generation.conceptName}`,
      status: 'PAUSED', // Default to PAUSED for safety
      effectiveStatus: 'PAUSED',
      configuredStatus: 'PAUSED',
      dailyBudget: 500000,
    },
  });

  await prisma.aIGeneration.update({
    where: { id: generation.id },
    data: { publishedMetaAdId: metaAdId },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      userName: session.email,
      action: 'PUBLISH_AI_AD',
      objectType: 'AD',
      objectId: dbAd.id,
      details: JSON.stringify({ metaAdId, conceptName: generation.conceptName }),
      result: 'SUCCESS',
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Successfully published ad draft to Meta (Status: PAUSED). You can now activate it from Ads Manager.',
    metaAdId,
    ad: dbAd,
  });
}
