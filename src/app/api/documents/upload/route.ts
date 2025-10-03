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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'application' or 'legal-document'
    const applicationId = formData.get('applicationId') as string;
    const documentType = formData.get('documentType') as string;

    // Basic validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Upload type is required' },
        { status: 400 }
      );
    }

    // Validate based on upload type
    if (type === 'application') {
      if (!applicationId) {
        return NextResponse.json(
          { error: 'Application ID is required for application uploads' },
          { status: 400 }
        );
      }

      if (!documentType) {
        return NextResponse.json(
          { error: 'Document type is required for application uploads' },
          { status: 400 }
        );
      }
    }

    // Check if application exists (only for application type)
    let application = null;
    if (type === 'application') {
      application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          cooperationType: {
            select: { requiredDocumentsJson: true },
          },
        },
      });

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
    }

    // Validate document type against application requirements (only for application type)
    if (type === 'application' && application) {
      const requiredDocuments = JSON.parse(application.cooperationType.requiredDocumentsJson as string);
      const isValidDocumentType = requiredDocuments.some((doc: { key: string; required: boolean }) => doc.key === documentType);

      if (!isValidDocumentType) {
        return NextResponse.json(
          { error: 'Invalid document type for this application' },
          { status: 400 }
        );
      }
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

    // Check for duplicate files (only for application type)
    if (type === 'application') {
      const existingDocument = await prisma.document.findFirst({
        where: {
          applicationId,
          documentType,
          fileHash,
        },
      });

      if (existingDocument) {
        return NextResponse.json(
          { error: 'This file has already been uploaded for this document type' },
          { status: 409 }
        );
      }
    }

    // Create upload directory structure based on type
    let uploadPath: string;
    let fileType: 'image' | 'document' | 'legal' | 'sop' = 'document';

    if (type === 'legal-document') {
      fileType = 'legal';
      uploadPath = createUploadPath(validation.sanitizedFilename!, fileType);
    } else if (type === 'sop-document') {
      fileType = 'sop';
      uploadPath = createUploadPath(validation.sanitizedFilename!, fileType);
    } else {
      uploadPath = createUploadPath(validation.sanitizedFilename!, fileType);
    }

    // Ensure upload directory exists
    await ensureUploadDir(uploadPath);
    const fullUploadPath = path.join(getUploadDir(), uploadPath);

    // Save file to disk
    await writeFile(fullUploadPath, buffer);

    // Get relative path for database storage
    const relativePath = getRelativePath(fullUploadPath);

    // Save document record to database (only for application type)
    let document = null;
    if (type === 'application') {
      // Get system user for public uploads
      const systemUser = await prisma.user.findUnique({
        where: { username: 'system' }
      });

      if (!systemUser) {
        return NextResponse.json(
          { error: 'System user not found. Please run database seed.' },
          { status: 500 }
        );
      }

      document = await prisma.document.create({
        data: {
          application: {
            connect: { id: applicationId }
          },
          originalFilename: file.name,
          storedFilename: validation.sanitizedFilename!,
          relativePath: relativePath,
          fileSize: file.size,
          mimeType: validation.detectedMimeType!,
          fileHash,
          virusScanResult: JSON.stringify({
            isClean: virusScanResult.isClean,
            scanTime: virusScanResult.scanTime,
            threat: virusScanResult.threat,
          }),
          uploader: {
            connect: { id: systemUser.id }
          }, // Use system user for public submissions
          documentType,
        },
      });
    }

    // Create activity log (only for application type)
    if (type === 'application' && document) {
      // Get system user for activity log
      const systemUser = await prisma.user.findUnique({
        where: { username: 'system' }
      });

      if (systemUser) {
        await prisma.activityLog.create({
          data: {
            userId: systemUser.id,
            entityType: 'document',
            entityId: document.id,
            action: 'UPLOAD',
            description: `Document uploaded: ${file.name} for application ${applicationId}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        });
      }

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          originalFilename: document.originalFilename,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          documentType: document.documentType,
          uploadedAt: document.uploadedAt,
        },
        message: 'File uploaded successfully',
      });
    } else {
      // For legal documents, just return file info
      return NextResponse.json({
        success: true,
        relativePath: relativePath,
        originalFilename: file.name,
        fileSize: file.size,
        mimeType: validation.detectedMimeType!,
        message: 'File uploaded successfully',
      });
    }

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed due to server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const documents = await prisma.document.findMany({
      where: { applicationId },
      select: {
        id: true,
        originalFilename: true,
        fileSize: true,
        mimeType: true,
        documentType: true,
        uploadedAt: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({ documents });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}