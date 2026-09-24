export interface AICopyRequest {
  productName: string;
  productDescription: string;
  targetAudience: string;
  targetCountry: string;
  tone: string;
  objective: string;
}

export interface AICopyVariation {
  conceptName: string;
  headline: string;
  primaryText: string;
  description: string;
  callToAction: string;
  imagePrompt: string;
  videoScript: string;
}

export interface AICommentClassification {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  category: 'QUESTION' | 'PURCHASE_INTENT' | 'COMPLAINT' | 'SPAM' | 'REFUND' | 'PRICING' | 'OTHER';
  purchaseIntent: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedReply?: string;
}

export interface AIComplianceResult {
  status: 'PASS' | 'WARNING' | 'REVIEW_REQUIRED';
  score: number; // 0-100
  checks: {
    rule: string;
    passed: boolean;
    reason?: string;
  }[];
}

export interface IAIProvider {
  generateAdConcepts(req: AICopyRequest): Promise<AICopyVariation[]>;
  classifyComment(commentText: string, productContext?: string): Promise<AICommentClassification>;
  checkAdCompliance(headline: string, primaryText: string): Promise<AIComplianceResult>;
  analyzeAdCreative(imageUrl: string, headline: string): Promise<{
    hookType: string;
    psychologicalAngle: string;
    creativeStructure: string;
    reasonsForPerformance: string[];
  }>;
}
