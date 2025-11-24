import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import {
  validateFile,
  performVirusScan,
  calculateFileHash,
  MAX_FILE_SIZE,
} from '@/lib/file-security';
import { getUploadDir, getRelativePath, createUploadPath, ensureUploadDir } from '@/lib/file-paths';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const cooperationId = formData.get('cooperationId') as string;
    const documentType = formData.get('documentType') as string || 'agreement'; // agreement, supporting, amendment

    // Basic validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!cooperationId) {
      return NextResponse.json(
        { error: 'Cooperation ID is required' },
        { status: 400 }
      );
    }

    // Check if cooperation exists
    const cooperation = await prisma.cooperation.findUnique({
      where: { id: cooperationId },
    });

    if (!cooperation) {
      return NextResponse.json(
        { error: 'Cooperation not found' },
        { status: 404 }
      );
    }

    // Check file size before processing
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Security validation
    const validation = validateFile(buffer, file.name, file.type);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Virus scanning
    const virusScanResult = await performVirusScan(buffer);
    if (!virusScanResult.isClean) {
      return NextResponse.json(
        { error: 'File contains malicious content and cannot be uploaded' },
        { status: 400 }
      );
    }

    // Calculate file hash for integrity
    const fileHash = calculateFileHash(buffer);

    // Create upload directory structure
    const uploadPath = createUploadPath(validation.sanitizedFilename!, 'cooperation');
    await ensureUploadDir(uploadPath);
    const fullUploadPath = path.join(getUploadDir(), uploadPath);

    // Save file to disk
    await writeFile(fullUploadPath, buffer);

    // Get relative path for database storage
    const relativePath = getRelativePath(fullUploadPath);

    // Generate document number if not provided
    const documentNumber = formData.get('documentNumber') as string ||
      `${cooperation.cooperationType}-${cooperation.partnerInstitution.substring(0, 3).toUpperCase()}-${Date.now()}`;

    // Update cooperation with document information
    const updatedCooperation = await prisma.cooperation.update({
      where: { id: cooperationId },
      data: {
        documentPath: relativePath,
        documentNumber,
        documentSize: file.size,
        documentMimeType: validation.detectedMimeType!,
      },
      include: {
        application: {
          select: {
            id: true,
            title: true,
            trackingNumber: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      cooperation: updatedCooperation,
      document: {
        documentPath: relativePath,
        documentNumber,
        originalFilename: file.name,
        fileSize: file.size,
        mimeType: validation.detectedMimeType!,
        documentType,
      },
      message: 'Document uploaded successfully',
    });

  } catch (error) {
    console.error('Cooperation document upload error:', error);
    return NextResponse.json(
      { error: 'Document upload failed due to server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cooperationId = searchParams.get('cooperationId');

    if (!cooperationId) {
      return NextResponse.json(
        { error: 'Cooperation ID is required' },
        { status: 400 }
      );
    }

    // Check if cooperation exists
    const cooperation = await prisma.cooperation.findUnique({
      where: { id: cooperationId },
    });

    if (!cooperation) {
      return NextResponse.json(
        { error: 'Cooperation not found' },
        { status: 404 }
      );
    }

    // Remove document information from cooperation
    const updatedCooperation = await prisma.cooperation.update({
      where: { id: cooperationId },
      data: {
        documentPath: null,
        documentNumber: null,
        documentSize: null,
        documentMimeType: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document removed successfully',
    });

  } catch (error) {
    console.error('Document removal error:', error);
    return NextResponse.json(
      { error: 'Document removal failed due to server error' },
      { status: 500 }
    );
  }
}