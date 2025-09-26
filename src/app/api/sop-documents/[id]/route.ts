import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const updateSOPDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  imagePath: z.string().optional(),
  features: z.array(z.string()).optional(),
  downloadInfo: z.object({
    fileName: z.string().optional(),
    fileSize: z.string().optional(),
    fileType: z.string().optional(),
    lastUpdated: z.string().optional(),
    url: z.string().optional()
  }).optional(),
  color: z.string().optional(),
  displayOrder: z.number().optional(),
  active: z.boolean().optional(),
});

// GET /api/sop-documents/[id] - Get specific SOP document
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const documentId = parseInt(params.id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    const sopDocument = await prisma.sOPDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        imagePath: true,
        features: true,
        downloadInfo: true,
        color: true,
        displayOrder: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!sopDocument) {
      return NextResponse.json(
        { error: 'SOP document not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields for easier frontend consumption
    const processedDocument = {
      ...sopDocument,
      features: sopDocument.features ? (sopDocument.features as string[]) : [],
      downloadInfo: sopDocument.downloadInfo ? (sopDocument.downloadInfo as Record<string, unknown>) : null,
    };

    return NextResponse.json(processedDocument);
  } catch (error) {
    console.error('Error fetching SOP document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOP document' },
      { status: 500 }
    );
  }
}

// PUT /api/sop-documents/[id] - Update SOP document
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication (admin only)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const documentId = parseInt(params.id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateSOPDocumentSchema.parse(body);

    // Check if document exists
    const existingDocument = await prisma.sOPDocument.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'SOP document not found' },
        { status: 404 }
      );
    }

    // Convert arrays to JSON for storage
    const dbData = {
      ...validatedData,
      features: validatedData.features ? JSON.stringify(validatedData.features) : undefined,
      downloadInfo: validatedData.downloadInfo ? JSON.stringify(validatedData.downloadInfo) : undefined,
    };

    const updatedDocument = await prisma.sOPDocument.update({
      where: { id: documentId },
      data: dbData,
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating SOP document:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update SOP document' },
      { status: 500 }
    );
  }
}

// DELETE /api/sop-documents/[id] - Delete SOP document
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication (admin only)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const documentId = parseInt(params.id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Check if document exists
    const existingDocument = await prisma.sOPDocument.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'SOP document not found' },
        { status: 404 }
      );
    }

    // Delete the files from filesystem if they exist
    try {
      // Delete main document file if exists
      const downloadInfo = existingDocument.downloadInfo as Record<string, unknown>;
      if (downloadInfo && downloadInfo.relativePath) {
        const filePath = path.join(process.cwd(), 'public', downloadInfo.relativePath as string);
        await fs.access(filePath);
        await fs.unlink(filePath);
      }

      // Delete image file if exists
      if (existingDocument.imagePath) {
        const imagePath = path.join(process.cwd(), 'public', existingDocument.imagePath as string);
        await fs.access(imagePath);
        await fs.unlink(imagePath);
      }
    } catch (fileError) {
      // Files don't exist or can't be deleted, continue with database deletion
      console.warn('Could not delete files for SOP document:', existingDocument.id, fileError);
    }

    // Delete from database
    await prisma.sOPDocument.delete({
      where: { id: documentId },
    });

    return NextResponse.json(
      { message: 'SOP document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting SOP document:', error);
    return NextResponse.json(
      { error: 'Failed to delete SOP document' },
      { status: 500 }
    );
  }
}