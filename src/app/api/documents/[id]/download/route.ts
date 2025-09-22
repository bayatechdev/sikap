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
      if (!token || token !== document.application.publicToken) {
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

    // Create response with security headers
    const response = new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': document.mimeType,
        'Content-Length': document.fileSize.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(document.originalFilename)}"`,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    // Log download activity - use system user for public downloads
    const systemUser = await prisma.user.findUnique({
      where: { username: 'system' }
    });

    if (systemUser) {
      await prisma.activityLog.create({
        data: {
          userId: document.application.userId || systemUser.id,
          entityType: 'document',
          entityId: document.id,
          action: 'DOWNLOAD',
          description: `Document downloaded: ${document.originalFilename}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    }

    return response;

  } catch (error) {
    console.error('Document download error:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}