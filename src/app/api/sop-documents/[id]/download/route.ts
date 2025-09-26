import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// GET /api/sop-documents/[id]/download - Download SOP document file
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
    const sopDocument = await prisma.sOPDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        downloadInfo: true,
      },
    });

    if (!sopDocument) {
      return NextResponse.json(
        { error: 'SOP document not found' },
        { status: 404 }
      );
    }

    const downloadInfo = sopDocument.downloadInfo as Record<string, unknown>;
    if (!downloadInfo || !downloadInfo.relativePath) {
      return NextResponse.json(
        { error: 'No file available for download' },
        { status: 404 }
      );
    }

    // Check if file exists
    const filePath = path.join(process.cwd(), 'public', downloadInfo.relativePath as string);

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
    const filename = path.basename(downloadInfo.relativePath as string);

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
    }

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `inline; filename="${filename}"`);
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading SOP document:', error);
    return NextResponse.json(
      { error: 'Failed to download SOP document' },
      { status: 500 }
    );
  }
}