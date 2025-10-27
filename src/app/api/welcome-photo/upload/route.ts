import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import {
  validateFile,
  performVirusScan,
} from '@/lib/file-security';
import {
  createUploadPath,
  getPublicUploadDir
} from '@/lib/file-paths';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Basic validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type (only allow images)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed for welcome photo upload' },
        { status: 400 }
      );
    }

    // Size validation (max 5MB for welcome photo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Security validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
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

    // Create upload directory for welcome photos in public directory
    const uploadPath = createUploadPath(validation.sanitizedFilename!, 'image', 'welcome');
    console.log('📁 Creating upload path:', uploadPath);

    // For welcome photos, we use public directory for direct web access
    const publicDir = getPublicUploadDir();
    const targetDir = path.join(publicDir, path.dirname(uploadPath));
    console.log('📁 Target directory:', targetDir);

    // Ensure directory exists
    const { mkdir } = await import('fs/promises');
    await mkdir(targetDir, { recursive: true });

    const fullUploadPath = path.join(targetDir, validation.sanitizedFilename!);
    const relativePath = uploadPath; // Use the upload path directly as relative path

    console.log('📁 Full upload path:', fullUploadPath);
    console.log('📁 Relative path:', relativePath);

    // Save file to disk
    await writeFile(fullUploadPath, buffer);

    console.log('📸 Welcome photo uploaded:', {
      fileName: file.name,
      fileSize: file.size,
      relativePath: relativePath
    });

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
      relativePath: relativePath,
      message: 'Welcome photo uploaded successfully'
    });
  } catch (error) {
    console.error('Welcome photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload welcome photo' },
      { status: 500 }
    );
  }
}