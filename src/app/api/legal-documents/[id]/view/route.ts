import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// GET /api/legal-documents/[id]/view - View PDF inline in browser
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
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(process.cwd(), uploadDir, legalDocument.relativePath);

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

    // Set headers optimized for inline viewing
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `inline; filename="${filename}"`);
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Transfer-Encoding', 'binary');

    // Remove potential caching issues
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // CORS headers
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error viewing legal document:', error);
    return NextResponse.json(
      { error: 'Failed to view legal document' },
      { status: 500 }
    );
  }
}