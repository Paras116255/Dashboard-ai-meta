export type MetaObjectStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DISABLED' | 'IN_REVIEW' | 'REJECTED';

export interface MetaCampaignDTO {
  id: string;
  name: string;
  status: MetaObjectStatus;
  effectiveStatus: MetaObjectStatus;
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  roas: number;
}

export interface MetaAdSetDTO {
  id: string;
  campaignId: string;
  name: string;
  status: MetaObjectStatus;
  effectiveStatus: MetaObjectStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  targeting: Record<string, unknown>;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  roas: number;
}

export interface MetaAdDTO {
  id: string;
  campaignId: string;
  adSetId: string;
  name: string;
  status: MetaObjectStatus;
  effectiveStatus: MetaObjectStatus;
  dailyBudget?: number;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cpa: number;
  roas: number;
  creativeUrl?: string;
  headline?: string;
  body?: string;
}

export interface MetaCommentDTO {
  id: string;
  adId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdTime: string;
  isHidden: boolean;
  canHide: boolean;
  canDelete: boolean;
  canReply: boolean;
}

export interface MetaOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requiresManualAction?: boolean;
    manualActionUrl?: string;
  };
  rateLimitInfo?: {
    callCountPercentage: number;
    cpuTimePercentage: number;
  };
}

export interface IMetaProvider {
  getCampaigns(adAccountId: string): Promise<MetaOperationResult<MetaCampaignDTO[]>>;
  getAdSets(campaignId: string): Promise<MetaOperationResult<MetaAdSetDTO[]>>;
  getAds(adAccountId: string): Promise<MetaOperationResult<MetaAdDTO[]>>;
  pauseAd(adId: string): Promise<MetaOperationResult<{ adId: string; status: 'PAUSED' }>>;
  resumeAd(adId: string): Promise<MetaOperationResult<{ adId: string; status: 'ACTIVE' }>>;
  updateAdBudget(adId: string, dailyBudgetMinor: number): Promise<MetaOperationResult<{ adId: string; newBudget: number }>>;
  updateAdCopy(adId: string, headline: string, primaryText: string): Promise<MetaOperationResult<{ adId: string }>>;
  deleteAd(adId: string): Promise<MetaOperationResult<{ adId: string }>>;
  getComments(adId: string): Promise<MetaOperationResult<MetaCommentDTO[]>>;
  likeComment(commentId: string): Promise<MetaOperationResult<{ commentId: string }>>;
  hideComment(commentId: string): Promise<MetaOperationResult<{ commentId: string }>>;
  deleteComment(commentId: string): Promise<MetaOperationResult<{ commentId: string }>>;
  replyComment(commentId: string, message: string): Promise<MetaOperationResult<{ commentId: string; replyId: string }>>;
  publishAd(params: {
    adAccountId: string;
    campaignId: string;
    adSetId: string;
    name: string;
    headline: string;
    primaryText: string;
    callToAction: string;
    imageUrl?: string;
  }): Promise<MetaOperationResult<{ metaAdId: string }>>;
}
