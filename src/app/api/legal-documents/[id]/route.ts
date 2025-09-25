import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const updateLegalDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  documentNumber: z.string().min(1, 'Document number is required').optional(),
  year: z.string().min(4, 'Year is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  relativePath: z.string().min(1, 'File path is required').optional(),
  description: z.string().optional(),
});

// GET /api/legal-documents/[id] - Get specific legal document
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

    const legalDocument = await prisma.legalDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        documentNumber: true,
        year: true,
        category: true,
        relativePath: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!legalDocument) {
      return NextResponse.json(
        { error: 'Legal document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(legalDocument);
  } catch (error) {
    console.error('Error fetching legal document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal document' },
      { status: 500 }
    );
  }
}

// PUT /api/legal-documents/[id] - Update legal document
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
    const validatedData = updateLegalDocumentSchema.parse(body);

    // Check if document exists
    const existingDocument = await prisma.legalDocument.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Legal document not found' },
        { status: 404 }
      );
    }

    // Check if document number already exists (if being updated)
    if (validatedData.documentNumber && validatedData.documentNumber !== existingDocument.documentNumber) {
      const duplicateDocument = await prisma.legalDocument.findUnique({
        where: { documentNumber: validatedData.documentNumber },
      });

      if (duplicateDocument) {
        return NextResponse.json(
          { error: 'Document number already exists' },
          { status: 400 }
        );
      }
    }

    const updatedDocument = await prisma.legalDocument.update({
      where: { id: documentId },
      data: validatedData,
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating legal document:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update legal document' },
      { status: 500 }
    );
  }
}

// DELETE /api/legal-documents/[id] - Delete legal document
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
    const existingDocument = await prisma.legalDocument.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Legal document not found' },
        { status: 404 }
      );
    }

    // Delete the file from filesystem if it exists
    try {
      const filePath = path.join(process.cwd(), 'public', existingDocument.relativePath);
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (fileError) {
      // File doesn't exist or can't be deleted, continue with database deletion
      console.warn('Could not delete file:', existingDocument.relativePath, fileError);
    }

    // Delete from database
    await prisma.legalDocument.delete({
      where: { id: documentId },
    });

    return NextResponse.json(
      { message: 'Legal document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting legal document:', error);
    return NextResponse.json(
      { error: 'Failed to delete legal document' },
      { status: 500 }
    );
  }
}