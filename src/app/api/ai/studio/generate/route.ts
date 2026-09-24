import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getAIProvider } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId, productName, productDescription, targetAudience, targetCountry, tone } = await req.json();

  const aiProvider = getAIProvider();
  const concepts = await aiProvider.generateAdConcepts({
    productName: productName || 'Product',
    productDescription: productDescription || '',
    targetAudience: targetAudience || 'Broad Adults',
    targetCountry: targetCountry || 'US',
    tone: tone || 'Direct Response',
    objective: 'OUTCOME_SALES',
  });

  const createdGenerations = [];
  if (projectId) {
    for (const concept of concepts) {
      const compliance = await aiProvider.checkAdCompliance(concept.headline, concept.primaryText);
      const gen = await prisma.aIGeneration.create({
        data: {
          organizationId: session.organizationId,
          projectId,
          conceptName: concept.conceptName,
          headline: concept.headline,
          primaryText: concept.primaryText,
          description: concept.description,
          callToAction: concept.callToAction,
          imageUrl: concept.imagePrompt ? 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800' : null,
          videoScript: concept.videoScript,
          complianceStatus: compliance.status,
          complianceDetails: JSON.stringify(compliance.checks),
        },
      });
      createdGenerations.push(gen);
    }
    await prisma.aIProject.update({
      where: { id: projectId },
      data: { status: 'GENERATED' },
    });
  }

  return NextResponse.json({
    success: true,
    concepts,
    generations: createdGenerations,
  });
}
