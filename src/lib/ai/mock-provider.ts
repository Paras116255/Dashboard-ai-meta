import { AICopyRequest, AICopyVariation, AICommentClassification, AIComplianceResult, IAIProvider } from './types';

export class MockAIProvider implements IAIProvider {
  async generateAdConcepts(req: AICopyRequest): Promise<AICopyVariation[]> {
    return [
      {
        conceptName: `Direct Problem-Solution (${req.tone})`,
        headline: `Stop Suffering From Poor Quality ${req.productName} 🛑`,
        primaryText: `If you are in ${req.targetCountry} and fit into ${req.targetAudience}, this is built specifically for you. ${req.productDescription}. Get yours before stock runs out!`,
        description: 'Special 20% OFF Launch Discount Available Today',
        callToAction: 'SHOP_NOW',
        imagePrompt: `High resolution commercial product photography of ${req.productName}, studio lighting, minimalist neutral background, 4k ultra realistic`,
        videoScript: `HOOK (0-3s): Show frustrating struggle with old alternative.\nBODY (3-12s): Show effortless unpacking and key features of ${req.productName}.\nCTA (12-15s): Tap Shop Now for free shipping!`,
      },
      {
        conceptName: 'Social Proof & UGC Testimonial',
        headline: 'Why 15,000+ Customers Rated This 5 Stars ⭐⭐⭐⭐⭐',
        primaryText: `I was skeptical at first, but ${req.productName} completely changed my daily routine. Super premium build, insanely fast shipping, and top-tier customer support.`,
        description: 'Free Express Shipping + 30-Day Guarantee',
        callToAction: 'GET_OFFER',
        imagePrompt: `UGC style candid photo of happy person holding ${req.productName} outdoors, authentic natural lighting`,
        videoScript: `HOOK (0-3s): "Okay guys, I had to make a video about this..."\nBODY (3-12s): Demo of product in real life setting.\nCTA (12-15s): Grab yours link in bio!`,
      },
      {
        conceptName: 'Urgency & Scarcity Angle',
        headline: 'Flash Sale Ending Midnight: Claim 25% OFF 🔥',
        primaryText: `Due to viral social media demand, ${req.productName} is selling out faster than expected in ${req.targetCountry}. Don't wait until it's backordered.`,
        description: 'Limited Stock Remaining - Order Online Today',
        callToAction: 'SHOP_NOW',
        imagePrompt: `Dynamic macro shot of ${req.productName} with vibrant gold accent lighting`,
        videoScript: `HOOK (0-3s): Countdown timer graphics over product hero shot.\nBODY (3-12s): Top 3 reasons to order right now.\nCTA (12-15s): Claim your promo code before midnight!`,
      },
    ];
  }

  async classifyComment(commentText: string, productContext?: string): Promise<AICommentClassification> {
    const textLower = commentText.toLowerCase();

    if (textLower.includes('how much') || textLower.includes('price') || textLower.includes('where to buy') || textLower.includes('delivery') || textLower.includes('order')) {
      return {
        sentiment: 'POSITIVE',
        category: 'PURCHASE_INTENT',
        purchaseIntent: 'HIGH',
        suggestedReply: `Hi there! You can easily order directly from our official store here. Express shipping usually takes 2-4 business days! 🚀`,
      };
    }

    if (textLower.includes('fit') || textLower.includes('size') || textLower.includes('does it') || textLower.includes('is it')) {
      return {
        sentiment: 'NEUTRAL',
        category: 'QUESTION',
        purchaseIntent: 'MEDIUM',
        suggestedReply: `Great question! Yes, it is fully compatible. Check out our specs chart on the product page for full details.`,
      };
    }

    if (textLower.includes('dm me') || textLower.includes('make money') || textLower.includes('crypto')) {
      return {
        sentiment: 'NEGATIVE',
        category: 'SPAM',
        purchaseIntent: 'LOW',
      };
    }

    return {
      sentiment: 'POSITIVE',
      category: 'OTHER',
      purchaseIntent: 'LOW',
      suggestedReply: 'Thanks for the love! Let us know if you need anything else! ❤️',
    };
  }

  async checkAdCompliance(headline: string, primaryText: string): Promise<AIComplianceResult> {
    const combined = `${headline} ${primaryText}`.toLowerCase();
    const checks = [
      {
        rule: 'No Guaranteed Income/Financial Claims',
        passed: !combined.includes('make $') && !combined.includes('guaranteed profit'),
        reason: 'Meta Ads Policy Section 4.1 prohibits absolute financial return guarantees.',
      },
      {
        rule: 'No Medical Cure or Miracle Health Claims',
        passed: !combined.includes('cures') && !combined.includes('miracle cure'),
        reason: 'Health & Wellness products must not promise instant disease cures.',
      },
      {
        rule: 'No Misleading Fake Urgency Countdown',
        passed: true,
      },
      {
        rule: 'Clear Commercial Entity Identification',
        passed: true,
      },
    ];

    const failed = checks.filter((c) => !c.passed);
    let status: 'PASS' | 'WARNING' | 'REVIEW_REQUIRED' = 'PASS';
    if (failed.length > 0) {
      status = 'REVIEW_REQUIRED';
    }

    return {
      status,
      score: status === 'PASS' ? 98 : 65,
      checks,
    };
  }

  async analyzeAdCreative(imageUrl: string, headline: string): Promise<{
    hookType: string;
    psychologicalAngle: string;
    creativeStructure: string;
    reasonsForPerformance: string[];
  }> {
    return {
      hookType: 'Visual Demonstration Hook',
      psychologicalAngle: 'Loss Aversion & Premium Utility',
      creativeStructure: 'Problem Setup (0-3s) -> Feature Breakdown (4-10s) -> Social Proof (11-13s) -> Clear CTA (14-15s)',
      reasonsForPerformance: [
        'High contrast visual hook in the first 3 seconds stops the feed scroll.',
        'Displays tangible real-world product usage without generic stock video feel.',
        'Combines price justification with immediate risk-reversal guarantee.',
      ],
    };
  }
}
