import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getMetaProvider } from '@/lib/meta';
import { Logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const rules = await prisma.automationRule.findMany({
    where: { organizationId: session.organizationId, isEnabled: true },
  });

  const activeAds = await prisma.ad.findMany({
    where: { organizationId: session.organizationId, status: 'ACTIVE' },
  });

  const executedResults = [];
  const metaProvider = getMetaProvider();

  for (const rule of rules) {
    const targetAds = rule.adId ? activeAds.filter((a) => a.id === rule.adId) : activeAds;

    for (const ad of targetAds) {
      let isTriggered = false;
      let reason = '';

      if (rule.metricType === 'SPEND' && ad.spend >= rule.thresholdValue) {
        isTriggered = true;
        reason = `Spend (${(ad.spend / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}) reached threshold limit of ${(rule.thresholdValue / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`;
      } else if (rule.metricType === 'ROAS' && ad.roas < rule.thresholdValue) {
        isTriggered = true;
        reason = `ROAS (${ad.roas}) dropped below target threshold of ${rule.thresholdValue}`;
      } else if (rule.metricType === 'CTR' && ad.ctr < rule.thresholdValue) {
        isTriggered = true;
        reason = `CTR (${ad.ctr}%) fell below minimum threshold of ${rule.thresholdValue}%`;
      }

      if (isTriggered) {
        // Cooldown & Idempotency check
        if (rule.lastTriggeredAt) {
          const cooldownMs = rule.cooldownMinutes * 60 * 1000;
          if (Date.now() - rule.lastTriggeredAt.getTime() < cooldownMs) {
            Logger.info('Skipping automation execution due to cooldown', { ruleId: rule.id, adId: ad.id });
            continue;
          }
        }

        // Execute action via Meta API
        if (rule.action === 'PAUSE_AD') {
          const metaRes = await metaProvider.pauseAd(ad.metaAdId);
          if (metaRes.success) {
            await prisma.ad.update({
              where: { id: ad.id },
              data: { status: 'PAUSED', effectiveStatus: 'PAUSED' },
            });

            await prisma.automationRule.update({
              where: { id: rule.id },
              data: { lastTriggeredAt: new Date() },
            });

            const execution = await prisma.automationExecution.create({
              data: {
                organizationId: session.organizationId,
                ruleId: rule.id,
                adId: ad.id,
                triggeredBy: reason,
                actionTaken: 'PAUSED_AD',
                status: 'SUCCESS',
                details: JSON.stringify({ adName: ad.name, metaAdId: ad.metaAdId }),
              },
            });

            await prisma.auditLog.create({
              data: {
                organizationId: session.organizationId,
                action: 'AUTOMATION_PAUSE_AD',
                objectType: 'AD',
                objectId: ad.id,
                details: JSON.stringify({ ruleName: rule.name, reason }),
                result: 'SUCCESS',
              },
            });

            await prisma.notification.create({
              data: {
                organizationId: session.organizationId,
                title: '🛑 Ad Automatically Paused',
                message: `Rule "${rule.name}" automatically paused "${ad.name}". Reason: ${reason}`,
                type: 'WARNING',
              },
            });

            executedResults.push(execution);
          }
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    triggeredCount: executedResults.length,
    executions: executedResults,
  });
}
