import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getUploadDir, getPublicUploadDir } from '@/lib/file-paths';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params;

    if (!filePath || filePath.length === 0) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Construct file path - check both public uploads and private uploads directories
    const relativePath = filePath.join('/');
    const publicUploadDir = getPublicUploadDir();
    const privateUploadDir = getUploadDir();

    const publicFilePath = path.join(publicUploadDir, relativePath);
    const privateFilePath = path.join(privateUploadDir, relativePath);

    let fullPath: string;
    let isPublicFile = false;

    // Check which path exists (prioritize public files for direct access)
    if (existsSync(publicFilePath)) {
      fullPath = publicFilePath;
      isPublicFile = true;
    } else if (existsSync(privateFilePath)) {
      fullPath = privateFilePath;
      isPublicFile = false;
    } else {
      return NextResponse.json(
        {
          error: 'File not found',
          details: {
            requestedPath: relativePath,
            publicPath: publicFilePath,
            privatePath: privateFilePath,
            publicExists: existsSync(publicFilePath),
            privateExists: existsSync(privateFilePath)
          }
        },
        { status: 404 }
      );
    }

    // Security check - ensure path is within allowed upload directories
    const normalizedPath = path.normalize(fullPath);
    const normalizedPublicDir = path.normalize(publicUploadDir);
    const normalizedPrivateDir = path.normalize(privateUploadDir);

    if (!normalizedPath.startsWith(normalizedPublicDir) && !normalizedPath.startsWith(normalizedPrivateDir)) {
      return NextResponse.json(
        { error: 'Unauthorized file access' },
        { status: 403 }
      );
    }

    // Read file
    const fileBuffer = await readFile(fullPath);

    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }

    // Return file with appropriate headers
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': isPublicFile ? 'inline' : 'attachment',
    };

    // Add security headers for private files
    if (!isPublicFile) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    console.log(`📁 Serving file: ${relativePath} (${isPublicFile ? 'public' : 'private'})`);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}