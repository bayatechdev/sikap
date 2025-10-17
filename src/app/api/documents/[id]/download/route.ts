import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';
import { getFullFilePath } from '@/lib/file-paths';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const documentId = params.id;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token'); // Public token for access control

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document details
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        application: {
          select: {
            id: true,
            publicToken: true,
            trackingNumber: true,
            isPublicSubmission: true,
            userId: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Access control for public submissions
    if (document.application.isPublicSubmission) {
      if (!token || (token !== document.application.publicToken && token !== document.application.trackingNumber)) {
        return NextResponse.json(
          { error: 'Invalid access token' },
          { status: 403 }
        );
      }
    }

    // Construct full file path from relative path stored in database
    const fullFilePath = getFullFilePath(document.relativePath);

    // Check if file exists on disk
    if (!existsSync(fullFilePath)) {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(fullFilePath);

    // Determine content disposition based on file type
    const isPDF = document.mimeType === 'application/pdf';
    const contentDisposition = isPDF
      ? `inline; filename="${encodeURIComponent(document.originalFilename)}"`
      : `attachment; filename="${encodeURIComponent(document.originalFilename)}"`;

    // Create response with security headers
    const response = new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': document.mimeType,
        'Content-Length': document.fileSize.toString(),
        'Content-Disposition': contentDisposition,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': isPDF ? 'SAMEORIGIN' : 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    // Log download activity - skip activity log for public downloads (no user associated)
    // Activity logs are only created for authenticated downloads from dashboard

    return response;

  } catch (error) {
    console.error('Document download error:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}