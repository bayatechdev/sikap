import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const applicationId = params.id;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        cooperationType: {
          select: {
            code: true,
            name: true,
          },
        },
        cooperationCategory: {
          select: {
            name: true,
          },
        },
        institution: {
          select: {
            name: true,
            type: true,
          },
        },
        documents: {
          select: {
            id: true,
            originalFilename: true,
            fileSize: true,
            mimeType: true,
            documentType: true,
            uploadedAt: true,
          },
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}