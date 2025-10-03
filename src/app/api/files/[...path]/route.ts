import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

    // Construct file path - check both public/uploads and uploads directories
    const relativePath = filePath.join('/');
    const publicFilePath = path.join(process.cwd(), 'public', 'uploads', relativePath);
    const uploadsFilePath = path.join(process.cwd(), 'uploads', relativePath);

    let fullPath: string;

    // Check which path exists
    if (existsSync(publicFilePath)) {
      fullPath = publicFilePath;
    } else if (existsSync(uploadsFilePath)) {
      fullPath = uploadsFilePath;
    } else {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Security check - ensure path is within upload directories
    const normalizedPath = path.normalize(fullPath);
    const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const uploadsDir = path.join(process.cwd(), 'uploads');

    if (!normalizedPath.startsWith(publicUploadsDir) && !normalizedPath.startsWith(uploadsDir)) {
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
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': 'inline',
      },
    });

  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}