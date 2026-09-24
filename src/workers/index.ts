import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import prisma from '../lib/prisma';
import { getMetaProvider } from '../lib/meta';
import { getAIProvider } from '../lib/ai';
import { Logger } from '../lib/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

// Queues definitions
export const metaSyncQueue = new Queue('meta-sync', { connection: connection as any });
export const automationQueue = new Queue('budget-automation', { connection: connection as any });
export const commentAIQueue = new Queue('comment-analysis', { connection: connection as any });
export const trendDiscoveryQueue = new Queue('trend-discovery', { connection: connection as any });

/**
 * Worker: Meta Synchronization
 */
export const metaSyncWorker = new Worker(
  'meta-sync',
  async (job) => {
    Logger.info(`🔄 Running Meta Sync Job [${job.id}] for Org: ${job.data.organizationId}`);
    const metaProvider = getMetaProvider(job.data.accessToken);
    const res = await metaProvider.getAds(job.data.adAccountId || 'act_994021049281');

    if (res.success && res.data) {
      for (const metaAd of res.data) {
        await prisma.ad.updateMany({
          where: { metaAdId: metaAd.id },
          data: {
            spend: metaAd.spend,
            impressions: metaAd.impressions,
            clicks: metaAd.clicks,
            ctr: metaAd.ctr,
            cpc: metaAd.cpc,
            roas: metaAd.roas,
            lastSyncedAt: new Date(),
          },
        });
      }
      Logger.info(`✅ Meta Sync completed for ${res.data.length} ads`);
    }
  },
  { connection: connection as any }
);

/**
 * Worker: Budget Threshold Automation
 */
export const automationWorker = new Worker(
  'budget-automation',
  async (job) => {
    Logger.info(`🛡️ Running Budget Automation Evaluation [${job.id}]`);
    const activeAds = await prisma.ad.findMany({ where: { status: 'ACTIVE' } });
    const rules = await prisma.automationRule.findMany({ where: { isEnabled: true } });
    const metaProvider = getMetaProvider();

    for (const rule of rules) {
      for (const ad of activeAds) {
        if (rule.metricType === 'SPEND' && ad.spend >= rule.thresholdValue) {
          Logger.warn(`⚠️ Triggering Auto-Pause for Ad ${ad.name} (Spend ${ad.spend} >= ${rule.thresholdValue})`);
          await metaProvider.pauseAd(ad.metaAdId);
          await prisma.ad.update({ where: { id: ad.id }, data: { status: 'PAUSED' } });
        }
      }
    }
  },
  { connection: connection as any }
);

/**
 * Worker: Comment AI Sentiment & Purchase Intent Analysis
 */
export const commentWorker = new Worker(
  'comment-analysis',
  async (job) => {
    const { commentId, text } = job.data;
    const ai = getAIProvider();
    const result = await ai.classifyComment(text);

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        sentiment: result.sentiment,
        category: result.category,
        purchaseIntent: result.purchaseIntent,
        replyText: result.suggestedReply,
      },
    });
    Logger.info(`🤖 Comment ${commentId} classified as ${result.category} (${result.sentiment})`);
  },
  { connection: connection as any }
);

Logger.info('⚡ BullMQ Workers initialized and waiting for jobs.');
