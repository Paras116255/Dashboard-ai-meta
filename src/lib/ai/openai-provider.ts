import { AICopyRequest, AICopyVariation, AICommentClassification, AIComplianceResult, IAIProvider } from './types';
import { MockAIProvider } from './mock-provider';

export class OpenAIProvider implements IAIProvider {
  private apiKey: string;
  private model: string;
  private fallback: MockAIProvider;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.fallback = new MockAIProvider();
  }

  async generateAdConcepts(req: AICopyRequest): Promise<AICopyVariation[]> {
    if (!this.apiKey || this.apiKey.includes('mock')) {
      return this.fallback.generateAdConcepts(req);
    }
    try {
      const prompt = `You are a world-class Meta ads direct-response copywriter.
Product: ${req.productName}
Description: ${req.productDescription}
Target Audience: ${req.targetAudience}
Country: ${req.targetCountry}
Tone: ${req.tone}
Objective: ${req.objective}

Generate 3 distinct high-converting Meta ad variations in JSON format containing an array of objects with fields:
conceptName, headline, primaryText, description, callToAction, imagePrompt, videoScript.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      });

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return parsed.variations || parsed.concepts || parsed;
      }
      return this.fallback.generateAdConcepts(req);
    } catch {
      return this.fallback.generateAdConcepts(req);
    }
  }

  async classifyComment(commentText: string, productContext?: string): Promise<AICommentClassification> {
    return this.fallback.classifyComment(commentText, productContext);
  }

  async checkAdCompliance(headline: string, primaryText: string): Promise<AIComplianceResult> {
    return this.fallback.checkAdCompliance(headline, primaryText);
  }

  async analyzeAdCreative(imageUrl: string, headline: string) {
    return this.fallback.analyzeAdCreative(imageUrl, headline);
  }
}
