import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  validateFile,
  performVirusScan,
  calculateFileHash,
} from '@/lib/file-security';
import { getUploadDir, getRelativePath, createUploadPath, ensureUploadDir } from '@/lib/file-paths';

const COOPERATION_TYPE_MAX_SIZE = 10 * 1024 * 1024; // 10MB for cooperation type documents
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const cooperationTypeId = formData.get('cooperationTypeId') as string;

    // Basic validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (type !== 'cooperation-type-document') {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    // Check file size before processing
    if (file.size > COOPERATION_TYPE_MAX_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 10MB limit` },
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

    // Create upload directory structure for cooperation types
    let uploadPath: string;
    if (cooperationTypeId) {
      uploadPath = createUploadPath(
        validation.sanitizedFilename!,
        'cooperation-types',
        cooperationTypeId
      );
    } else {
      uploadPath = createUploadPath(validation.sanitizedFilename!, 'cooperation-types');
    }

    // Ensure upload directory exists
    await ensureUploadDir(uploadPath);
    const fullUploadPath = path.join(getUploadDir(), uploadPath);

    // Save file to disk
    await writeFile(fullUploadPath, buffer);

    // Get relative path for database storage
    const relativePath = getRelativePath(fullUploadPath);

    // Generate filename for display (remove extension and clean up)
    const displayName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    return NextResponse.json({
      success: true,
      fileName: displayName,
      relativePath: relativePath,
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: validation.detectedMimeType!,
      fileHash: fileHash,
      message: 'Cooperation type document uploaded successfully',
    });

  } catch (error) {
    console.error('Cooperation type document upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed due to server error' },
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
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Security: validate that the file path is within allowed directories
    if (!filePath.includes('cooperation-types/')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    const fullFilePath = path.join(getUploadDir(), filePath);

    // Additional security: ensure we're not trying to delete files outside upload directory
    const normalizedUploadDir = path.normalize(getUploadDir());
    const normalizedFilePath = path.normalize(fullFilePath);

    if (!normalizedFilePath.startsWith(normalizedUploadDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Try to delete the file
    try {
      const { unlink } = await import('fs/promises');
      await unlink(normalizedFilePath);

      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (deleteError) {
      // If file doesn't exist, that's okay for our use case
      if ((deleteError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({
          success: true,
          message: 'File already removed'
        });
      }
      throw deleteError;
    }

  } catch (error) {
    console.error('Error deleting cooperation type document:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}