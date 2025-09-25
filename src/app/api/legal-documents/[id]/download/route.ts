import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// GET /api/legal-documents/[id]/download - Download legal document file
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

    // Get document from database
    const legalDocument = await prisma.legalDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        documentNumber: true,
        relativePath: true,
      },
    });

    if (!legalDocument) {
      return NextResponse.json(
        { error: 'Legal document not found' },
        { status: 404 }
      );
    }

    // Check if file exists
    const filePath = path.join(process.cwd(), 'public', legalDocument.relativePath);

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath);
    const filename = path.basename(legalDocument.relativePath);

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `inline; filename="${filename}"`);
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading legal document:', error);
    return NextResponse.json(
      { error: 'Failed to download legal document' },
      { status: 500 }
    );
  }
}