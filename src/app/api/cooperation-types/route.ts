import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const createCooperationTypeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),

  // Homepage display fields
  displayTitle: z.string().optional(),
  longDescription: z.string().optional(),
  features: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional(),
  downloadInfo: z.object({
    fileName: z.string().optional(),
    fileSize: z.string().optional(),
    fileType: z.string().optional(),
    docType: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional()
  }).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.number().optional(),
  showOnHomepage: z.boolean().optional(),

  // Workflow fields
  requiredDocuments: z.array(z.any()).optional(),
  workflowSteps: z.array(z.any()).optional(),
  active: z.boolean().optional(),
});


// GET /api/cooperation-types - List all cooperation types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const homepageOnly = searchParams.get('homepage') === 'true';

    const where: Record<string, unknown> = {};
    if (activeOnly) where.active = true;
    if (homepageOnly) where.showOnHomepage = true;

    const cooperationTypes = await prisma.cooperationType.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        displayTitle: true,
        longDescription: true,
        features: true,
        examples: true,
        downloadInfo: true,
        color: true,
        icon: true,
        displayOrder: true,
        showOnHomepage: true,
        requiredDocumentsJson: true,
        workflowStepsJson: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: homepageOnly ? { displayOrder: 'asc' } : { name: 'asc' },
    });

    // Parse JSON fields for easier frontend consumption
    const processedTypes = cooperationTypes.map(type => {
      // Helper function to safely parse JSON or return object if already parsed
      const safeParseJson = (field: unknown) => {
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return [];
          }
        }
        return field || [];
      };

      return {
        ...type,
        features: type.features ? (type.features as string[]) : [],
        examples: type.examples ? (type.examples as string[]) : [],
        downloadInfo: type.downloadInfo ? (type.downloadInfo as Record<string, unknown>) : null,
        requiredDocuments: safeParseJson(type.requiredDocumentsJson),
        workflowSteps: safeParseJson(type.workflowStepsJson),
      };
    });

    return NextResponse.json({ cooperationTypes: processedTypes });
  } catch (error) {
    console.error('Error fetching cooperation types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cooperation types' },
      { status: 500 }
    );
  }
}

// POST /api/cooperation-types - Create new cooperation type (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCooperationTypeSchema.parse(body);

    // Convert arrays to JSON for storage
    const dbData = {
      ...validatedData,
      features: validatedData.features ? JSON.stringify(validatedData.features) : null,
      examples: validatedData.examples ? JSON.stringify(validatedData.examples) : null,
      downloadInfo: validatedData.downloadInfo ? JSON.stringify(validatedData.downloadInfo) : null,
      requiredDocumentsJson: validatedData.requiredDocuments ? JSON.stringify(validatedData.requiredDocuments) : JSON.stringify([]),
      workflowStepsJson: validatedData.workflowSteps ? JSON.stringify(validatedData.workflowSteps) : JSON.stringify([]),
    };

    // Remove the array fields that are now in JSON format
    const { features, examples, downloadInfo, ...finalData } = dbData;

    const cooperationType = await prisma.cooperationType.create({
      data: {
        ...finalData,
        features: features || undefined,
        examples: examples || undefined,
        downloadInfo: downloadInfo || undefined,
        requiredDocumentsJson: dbData.requiredDocumentsJson,
        workflowStepsJson: dbData.workflowStepsJson,
      },
    });

    return NextResponse.json(cooperationType, { status: 201 });
  } catch (error) {
    console.error('Error creating cooperation type:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create cooperation type' },
      { status: 500 }
    );
  }
}