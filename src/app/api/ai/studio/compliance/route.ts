import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getAIProvider } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { headline, primaryText } = await req.json();

  const aiProvider = getAIProvider();
  const result = await aiProvider.checkAdCompliance(headline || '', primaryText || '');

  return NextResponse.json({ success: true, data: result });
}
