export interface MetaCapabilityCheck {
  isSupported: boolean;
  requiresAppReview: boolean;
  requiredPermission: string;
  note?: string;
  fallbackInstructions?: string;
}

export const META_CAPABILITIES: Record<string, MetaCapabilityCheck> = {
  'ad.pause': {
    isSupported: true,
    requiresAppReview: true,
    requiredPermission: 'ads_management',
  },
  'ad.resume': {
    isSupported: true,
    requiresAppReview: true,
    requiredPermission: 'ads_management',
  },
  'ad.update_budget': {
    isSupported: true,
    requiresAppReview: true,
    requiredPermission: 'ads_management',
    note: 'Budget changes apply at AdSet or Campaign level according to Advantage+ CBO settings.',
  },
  'ad.update_copy': {
    isSupported: true,
    requiresAppReview: true,
    requiredPermission: 'ads_management',
    note: 'Direct text edits create a new creative variation under Meta Graph API policy.',
  },
  'ad.delete': {
    isSupported: false,
    requiresAppReview: true,
    requiredPermission: 'ads_management',
    note: 'Meta Graph API restricts hard-deleting active published ads with impression history.',
    fallbackInstructions: 'Please archive or pause this ad directly inside Meta Ads Manager.',
  },
  'comment.read': {
    isSupported: true,
    requiresAppReview: true,
    requiredPermission: 'pages_read_engagement',
  },
  'comment.hide': {
    isSupported: true,
    requiresAppReview: true,
    requiredPermission: 'pages_manage_engagement',
  },
  'comment.delete': {
    isSupported: true,
    requiresAppReview: true,
    requiredPermission: 'pages_manage_engagement',
    note: 'Comment deletion requires page admin privileges.',
  },
  'comment.reply': {
    isSupported: true,
    requiresAppReview: true,
    requiredPermission: 'pages_manage_engagement',
  },
  'ad.update_targeting': {
    isSupported: false,
    requiresAppReview: true,
    requiredPermission: 'ads_management',
    note: 'Granular audience re-targeting edits require complex adset recreation on v20.0.',
    fallbackInstructions: 'This operation requires manual action in Meta Ads Manager.',
  },
};

export function checkMetaCapability(operation: string): MetaCapabilityCheck {
  return (
    META_CAPABILITIES[operation] || {
      isSupported: false,
      requiresAppReview: true,
      requiredPermission: 'ads_management',
      fallbackInstructions: 'This operation requires manual action in Meta Ads Manager.',
    }
  );
}
