import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const applicationTypes = await prisma.cooperationType.findMany({
      where: { active: true },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        requiredDocumentsJson: true,
        workflowStepsJson: true,
      },
      orderBy: { name: 'asc' },
    });

    // Parse JSON fields for easier frontend consumption
    const processedTypes = applicationTypes.map(type => ({
      ...type,
      requiredDocuments: JSON.parse(type.requiredDocumentsJson as string),
      workflowSteps: JSON.parse(type.workflowStepsJson as string),
    }));

    return NextResponse.json({ applicationTypes: processedTypes });
  } catch (error) {
    console.error('Error fetching application types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application types' },
      { status: 500 }
    );
  }
}