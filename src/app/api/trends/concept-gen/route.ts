import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getAIProvider } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { productName, productDescription, category, targetCountry } = await req.json();

  const aiProvider = getAIProvider();
  const concepts = await aiProvider.generateAdConcepts({
    productName: productName || 'Trending Product',
    productDescription: productDescription || `High velocity trending item in ${category || 'E-commerce'}`,
    targetAudience: 'Engaged Online Shoppers & Trend Early Adopters',
    targetCountry: targetCountry || 'US',
    tone: 'Urgent & Social Proof Heavy',
    objective: 'OUTCOME_SALES',
  });

  return NextResponse.json({ success: true, data: concepts });
}
