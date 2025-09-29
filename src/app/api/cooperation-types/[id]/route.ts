import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for update
const updateCooperationTypeSchema = z.object({
  code: z.string().min(1, 'Code is required').optional(),
  name: z.string().min(1, 'Name is required').optional(),
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

// GET /api/cooperation-types/[id] - Get single cooperation type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cooperationType = await prisma.cooperationType.findUnique({
      where: { id: parseInt(id) },
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
    });

    if (!cooperationType) {
      return NextResponse.json(
        { error: 'Cooperation type not found' },
        { status: 404 }
      );
    }

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

    // Parse JSON fields for easier frontend consumption
    const processedType = {
      ...cooperationType,
      features: cooperationType.features ? (cooperationType.features as string[]) : [],
      examples: cooperationType.examples ? (cooperationType.examples as string[]) : [],
      downloadInfo: cooperationType.downloadInfo ? (cooperationType.downloadInfo as Record<string, unknown>) : null,
      requiredDocuments: safeParseJson(cooperationType.requiredDocumentsJson),
      workflowSteps: safeParseJson(cooperationType.workflowStepsJson),
    };

    return NextResponse.json(processedType);
  } catch (error) {
    console.error('Error fetching cooperation type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cooperation type' },
      { status: 500 }
    );
  }
}

// PUT /api/cooperation-types/[id] - Update cooperation type (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateCooperationTypeSchema.parse(body);

    // Check if cooperation type exists
    const existingType = await prisma.cooperationType.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingType) {
      return NextResponse.json(
        { error: 'Cooperation type not found' },
        { status: 404 }
      );
    }

    // Convert arrays to JSON for storage
    const dbData = {
      ...validatedData,
      features: validatedData.features ? JSON.stringify(validatedData.features) : undefined,
      examples: validatedData.examples ? JSON.stringify(validatedData.examples) : undefined,
      downloadInfo: validatedData.downloadInfo ? JSON.stringify(validatedData.downloadInfo) : undefined,
      requiredDocumentsJson: validatedData.requiredDocuments ? JSON.stringify(validatedData.requiredDocuments) : undefined,
      workflowStepsJson: validatedData.workflowSteps ? JSON.stringify(validatedData.workflowSteps) : undefined,
    };

    // Remove the array fields that are now in JSON format
    const { features, examples, downloadInfo, ...updateData } = dbData;

    // Update cooperation type
    const cooperationType = await prisma.cooperationType.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        ...(features !== undefined && { features }),
        ...(examples !== undefined && { examples }),
        ...(downloadInfo !== undefined && { downloadInfo }),
        ...(dbData.requiredDocumentsJson && { requiredDocumentsJson: dbData.requiredDocumentsJson }),
        ...(dbData.workflowStepsJson && { workflowStepsJson: dbData.workflowStepsJson }),
      },
    });

    return NextResponse.json(cooperationType);
  } catch (error) {
    console.error('Error updating cooperation type:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update cooperation type' },
      { status: 500 }
    );
  }
}

// DELETE /api/cooperation-types/[id] - Delete cooperation type (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if cooperation type exists
    const existingType = await prisma.cooperationType.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingType) {
      return NextResponse.json(
        { error: 'Cooperation type not found' },
        { status: 404 }
      );
    }

    // Check if there are any applications using this cooperation type
    const applicationCount = await prisma.application.count({
      where: { cooperationTypeId: parseInt(id) },
    });

    if (applicationCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete cooperation type that is being used by applications' },
        { status: 400 }
      );
    }

    // Delete cooperation type
    await prisma.cooperationType.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Cooperation type deleted successfully' });
  } catch (error) {
    console.error('Error deleting cooperation type:', error);
    return NextResponse.json(
      { error: 'Failed to delete cooperation type' },
      { status: 500 }
    );
  }
}