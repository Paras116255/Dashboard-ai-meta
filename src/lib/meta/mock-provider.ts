import { IMetaProvider, MetaAdDTO, MetaAdSetDTO, MetaCampaignDTO, MetaCommentDTO, MetaOperationResult } from './types';
import { checkMetaCapability } from './capabilities';

export class MockMetaProvider implements IMetaProvider {
  async getCampaigns(adAccountId: string): Promise<MetaOperationResult<MetaCampaignDTO[]>> {
    return {
      success: true,
      data: [
        {
          id: '23851092830192',
          name: '🔥 Q3 Scaling - Waterproof Backpack (US/IN)',
          status: 'ACTIVE',
          effectiveStatus: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          dailyBudget: 1500000,
          spend: 9425000,
          impressions: 482000,
          reach: 310000,
          clicks: 14200,
          ctr: 2.95,
          cpc: 6.63,
          cpm: 195.5,
          conversions: 382,
          roas: 3.42,
        },
        {
          id: '23851092830193',
          name: '🎯 Retargeting - Add To Cart 7 Days',
          status: 'ACTIVE',
          effectiveStatus: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          dailyBudget: 500000,
          spend: 3200000,
          impressions: 98000,
          reach: 42000,
          clicks: 4900,
          ctr: 5.0,
          cpc: 6.53,
          cpm: 326.5,
          conversions: 185,
          roas: 4.85,
        },
      ],
      rateLimitInfo: { callCountPercentage: 12, cpuTimePercentage: 8 },
    };
  }

  async getAdSets(campaignId: string): Promise<MetaOperationResult<MetaAdSetDTO[]>> {
    return {
      success: true,
      data: [
        {
          id: '23851092830201',
          campaignId,
          name: 'US - Broad Adults 22-45 (Advantage+)',
          status: 'ACTIVE',
          effectiveStatus: 'ACTIVE',
          dailyBudget: 1000000,
          targeting: { geo: ['US'], age_min: 22, age_max: 45 },
          spend: 6420000,
          impressions: 340000,
          reach: 220000,
          clicks: 9800,
          ctr: 2.88,
          cpc: 6.55,
          cpm: 188.8,
          conversions: 260,
          roas: 3.55,
        },
      ],
    };
  }

  async getAds(adAccountId: string): Promise<MetaOperationResult<MetaAdDTO[]>> {
    return {
      success: true,
      data: [
        {
          id: '23851092830301',
          campaignId: '23851092830192',
          adSetId: '23851092830201',
          name: 'Backpack Hero UGC #1 - Waterproof Shower Test',
          status: 'ACTIVE',
          effectiveStatus: 'ACTIVE',
          dailyBudget: 600000,
          spend: 4200000,
          impressions: 210000,
          reach: 140000,
          clicks: 6500,
          ctr: 3.09,
          cpc: 6.46,
          cpm: 200.0,
          conversions: 180,
          cpa: 233.33,
          roas: 3.85,
          headline: 'Never Worry About Rain Again 🎒🌧️',
          body: 'Designed for digital nomads and weekend travelers. 100% waterproof TPU coating.',
        },
        {
          id: '23851092830302',
          campaignId: '23851092830192',
          adSetId: '23851092830201',
          name: 'Backpack Multi-Pocket Feature Breakdown',
          status: 'ACTIVE',
          effectiveStatus: 'ACTIVE',
          dailyBudget: 400000,
          spend: 2220000,
          impressions: 130000,
          reach: 80000,
          clicks: 3300,
          ctr: 2.54,
          cpc: 6.72,
          cpm: 170.7,
          conversions: 80,
          cpa: 277.5,
          roas: 3.02,
        },
      ],
    };
  }

  async pauseAd(adId: string): Promise<MetaOperationResult<{ adId: string; status: 'PAUSED' }>> {
    return {
      success: true,
      data: { adId, status: 'PAUSED' },
    };
  }

  async resumeAd(adId: string): Promise<MetaOperationResult<{ adId: string; status: 'ACTIVE' }>> {
    return {
      success: true,
      data: { adId, status: 'ACTIVE' },
    };
  }

  async updateAdBudget(adId: string, dailyBudgetMinor: number): Promise<MetaOperationResult<{ adId: string; newBudget: number }>> {
    return {
      success: true,
      data: { adId, newBudget: dailyBudgetMinor },
    };
  }

  async updateAdCopy(adId: string, headline: string, primaryText: string): Promise<MetaOperationResult<{ adId: string }>> {
    return {
      success: true,
      data: { adId },
    };
  }

  async deleteAd(adId: string): Promise<MetaOperationResult<{ adId: string }>> {
    const cap = checkMetaCapability('ad.delete');
    if (!cap.isSupported) {
      return {
        success: false,
        error: {
          code: 'META_UNSUPPORTED_OPERATION',
          message: cap.note || 'Meta API restricts deleting published ads with impressions.',
          requiresManualAction: true,
          manualActionUrl: `https://adsmanager.facebook.com/adsmanager/manage/ads?act=${adId}`,
        },
      };
    }
    return { success: true, data: { adId } };
  }

  async getComments(adId: string): Promise<MetaOperationResult<MetaCommentDTO[]>> {
    return {
      success: true,
      data: [
        {
          id: 'mcmt_1001',
          adId,
          authorName: 'Aarav Sharma',
          text: 'How long does delivery take to Bengaluru? I have a trip next Monday!',
          createdTime: new Date().toISOString(),
          isHidden: false,
          canHide: true,
          canDelete: true,
          canReply: true,
        },
      ],
    };
  }

  async likeComment(commentId: string): Promise<MetaOperationResult<{ commentId: string }>> {
    return { success: true, data: { commentId } };
  }

  async hideComment(commentId: string): Promise<MetaOperationResult<{ commentId: string }>> {
    return { success: true, data: { commentId } };
  }

  async deleteComment(commentId: string): Promise<MetaOperationResult<{ commentId: string }>> {
    return { success: true, data: { commentId } };
  }

  async replyComment(commentId: string, message: string): Promise<MetaOperationResult<{ commentId: string; replyId: string }>> {
    return {
      success: true,
      data: { commentId, replyId: `reply_${Date.now()}` },
    };
  }

  async publishAd(params: {
    adAccountId: string;
    campaignId: string;
    adSetId: string;
    name: string;
    headline: string;
    primaryText: string;
    callToAction: string;
    imageUrl?: string;
  }): Promise<MetaOperationResult<{ metaAdId: string }>> {
    return {
      success: true,
      data: { metaAdId: `23851092830${Math.floor(1000 + Math.random() * 9000)}` },
    };
  }
}
