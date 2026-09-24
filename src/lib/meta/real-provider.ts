import { IMetaProvider, MetaAdDTO, MetaAdSetDTO, MetaCampaignDTO, MetaCommentDTO, MetaOperationResult } from './types';

export class RealMetaProvider implements IMetaProvider {
  private apiVersion: string;

  constructor(private accessToken: string) {
    this.apiVersion = process.env.META_GRAPH_API_VERSION || 'v20.0';
  }

  private async fetchMeta<T>(endpoint: string, options: RequestInit = {}): Promise<MetaOperationResult<T>> {
    const url = `https://graph.facebook.com/${this.apiVersion}/${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${this.accessToken}`;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      const rateLimitHeader = res.headers.get('x-business-use-case-usage');
      let rateLimitInfo;
      if (rateLimitHeader) {
        try {
          const parsed = JSON.parse(rateLimitHeader);
          rateLimitInfo = {
            callCountPercentage: parsed[0]?.call_count || 0,
            cpuTimePercentage: parsed[0]?.total_cpu_time || 0,
          };
        } catch {}
      }

      const body = await res.json();
      if (!res.ok || body.error) {
        return {
          success: false,
          error: {
            code: body.error?.code?.toString() || 'META_API_ERROR',
            message: body.error?.message || 'Meta Graph API call failed',
          },
          rateLimitInfo,
        };
      }

      return {
        success: true,
        data: body.data || body,
        rateLimitInfo,
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Failed to reach Meta Graph API',
        },
      };
    }
  }

  async getCampaigns(adAccountId: string): Promise<MetaOperationResult<MetaCampaignDTO[]>> {
    return this.fetchMeta<MetaCampaignDTO[]>(`${adAccountId}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,insights{spend,impressions,reach,clicks,ctr,cpc,cpm,conversions}`);
  }

  async getAdSets(campaignId: string): Promise<MetaOperationResult<MetaAdSetDTO[]>> {
    return this.fetchMeta<MetaAdSetDTO[]>(`${campaignId}/adsets?fields=id,name,status,effective_status,daily_budget,targeting,insights{spend,impressions,reach,clicks,ctr,cpc,cpm,conversions}`);
  }

  async getAds(adAccountId: string): Promise<MetaOperationResult<MetaAdDTO[]>> {
    return this.fetchMeta<MetaAdDTO[]>(`${adAccountId}/ads?fields=id,name,status,effective_status,daily_budget,creative,insights{spend,impressions,reach,clicks,ctr,cpc,cpm,conversions}`);
  }

  async pauseAd(adId: string): Promise<MetaOperationResult<{ adId: string; status: 'PAUSED' }>> {
    return this.fetchMeta<{ adId: string; status: 'PAUSED' }>(`${adId}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'PAUSED' }),
    });
  }

  async resumeAd(adId: string): Promise<MetaOperationResult<{ adId: string; status: 'ACTIVE' }>> {
    return this.fetchMeta<{ adId: string; status: 'ACTIVE' }>(`${adId}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'ACTIVE' }),
    });
  }

  async updateAdBudget(adId: string, dailyBudgetMinor: number): Promise<MetaOperationResult<{ adId: string; newBudget: number }>> {
    return this.fetchMeta<{ adId: string; newBudget: number }>(`${adId}`, {
      method: 'POST',
      body: JSON.stringify({ daily_budget: dailyBudgetMinor }),
    });
  }

  async updateAdCopy(adId: string, headline: string, primaryText: string): Promise<MetaOperationResult<{ adId: string }>> {
    return this.fetchMeta<{ adId: string }>(`${adId}`, {
      method: 'POST',
      body: JSON.stringify({ creative: { title: headline, body: primaryText } }),
    });
  }

  async deleteAd(adId: string): Promise<MetaOperationResult<{ adId: string }>> {
    return this.fetchMeta<{ adId: string }>(`${adId}`, { method: 'DELETE' });
  }

  async getComments(adId: string): Promise<MetaOperationResult<MetaCommentDTO[]>> {
    return this.fetchMeta<MetaCommentDTO[]>(`${adId}/comments?fields=id,from,message,created_time,can_comment,can_hide,can_remove`);
  }

  async likeComment(commentId: string): Promise<MetaOperationResult<{ commentId: string }>> {
    return this.fetchMeta<{ commentId: string }>(`${commentId}/likes`, { method: 'POST' });
  }

  async hideComment(commentId: string): Promise<MetaOperationResult<{ commentId: string }>> {
    return this.fetchMeta<{ commentId: string }>(`${commentId}`, {
      method: 'POST',
      body: JSON.stringify({ is_hidden: true }),
    });
  }

  async deleteComment(commentId: string): Promise<MetaOperationResult<{ commentId: string }>> {
    return this.fetchMeta<{ commentId: string }>(`${commentId}`, { method: 'DELETE' });
  }

  async replyComment(commentId: string, message: string): Promise<MetaOperationResult<{ commentId: string; replyId: string }>> {
    return this.fetchMeta<{ commentId: string; replyId: string }>(`${commentId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
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
    return this.fetchMeta<{ metaAdId: string }>(`${params.adAccountId}/ads`, {
      method: 'POST',
      body: JSON.stringify({
        name: params.name,
        adset_id: params.adSetId,
        creative: {
          title: params.headline,
          body: params.primaryText,
          call_to_action: { type: params.callToAction },
          image_url: params.imageUrl,
        },
        status: 'PAUSED', // Safety default: create paused until explicit enable
      }),
    });
  }
}
