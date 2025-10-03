import path from 'path';

/**
 * Get the configured upload directory from environment variable
 * Supports both absolute and relative paths
 */
export function getUploadDir(): string {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';

  return path.isAbsolute(uploadDir)
    ? uploadDir
    : path.join(process.cwd(), uploadDir);
}

/**
 * Get the configured public upload directory for direct web access
 * Used for images, logos, and other files that need direct URL access
 */
export function getPublicUploadDir(): string {
  const publicUploadDir = process.env.PUBLIC_UPLOAD_DIR || './public/uploads';

  return path.isAbsolute(publicUploadDir)
    ? publicUploadDir
    : path.join(process.cwd(), publicUploadDir);
}

/**
 * Get the base URL for public file access
 * This is used to generate URLs for files that can be accessed directly
 * Auto-detects from request if environment variable is empty
 */
export function getUploadBaseUrl(request?: Request): string {
  // If environment variable is set and not empty, use it
  if (process.env.NEXT_PUBLIC_UPLOAD_BASE_URL) {
    return process.env.NEXT_PUBLIC_UPLOAD_BASE_URL;
  }

  // Auto-detect from request headers if available
  if (request) {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') ||
                    (request.headers.get('host')?.includes('localhost') ? 'http' : 'https');
    return `${protocol}://${host}/uploads`;
  }

  // Fallback to relative path
  return '/uploads';
}

/**
 * Generate public URL for a file in the public uploads directory
 * @param filename - The filename with extension
 * @param subfolder - Optional subfolder (e.g., 'hero', 'logos')
 * @param request - Optional request object for auto-detection
 * @returns Full URL for direct file access
 */
export function getPublicFileUrl(filename: string, subfolder?: string, request?: Request): string {
  const baseUrl = getUploadBaseUrl(request);
  const fullPath = subfolder ? `${subfolder}/${filename}` : filename;
  return `${baseUrl}/${fullPath}`;
}

/**
 * Generate API URL for protected file access
 * @param relativePath - The relative path stored in database
 * @param request - Optional request object for auto-detection
 * @returns API URL for secure file access
 */
export function getProtectedFileUrl(relativePath: string, request?: Request): string {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Auto-detect if not configured
  if (!baseUrl && request) {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') ||
                    (request.headers.get('host')?.includes('localhost') ? 'http' : 'https');
    baseUrl = `${protocol}://${host}`;
  }

  // Fallback
  if (!baseUrl) {
    baseUrl = 'http://localhost:3000';
  }

  return `${baseUrl}/api/files/${encodeURIComponent(relativePath)}`;
}

/**
 * Construct full file path from relative path stored in database
 * @param relativePath - The relative path stored in database (e.g., "2024/01/15/abc123.pdf")
 * @param isPublic - Whether the file is in public directory
 * @returns Full absolute path to the file
 */
export function getFullFilePath(relativePath: string, isPublic = false): string {
  const uploadDir = isPublic ? getPublicUploadDir() : getUploadDir();
  return path.join(uploadDir, relativePath);
}

/**
 * Create relative path for storing in database
 * This removes the upload directory prefix to keep only the relative part
 * @param fullPath - Full path including upload directory
 * @returns Relative path for database storage
 */
export function getRelativePath(fullPath: string): string {
  const uploadDir = getUploadDir();
  return path.relative(uploadDir, fullPath);
}

/**
 * Ensure upload directory exists
 * @param relativePath - Optional relative path to create subdirectories
 * @param isPublic - Whether to use public upload directory
 */
export async function ensureUploadDir(relativePath?: string, isPublic = false): Promise<string> {
  const { mkdir } = await import('fs/promises');
  const { existsSync } = await import('fs');

  let targetDir = isPublic ? getPublicUploadDir() : getUploadDir();

  if (relativePath) {
    targetDir = path.join(targetDir, path.dirname(relativePath));
  }

  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }

  return targetDir;
}

/**
 * Create upload path for a file based on its type
 * @param filename - The sanitized filename
 * @param fileType - Type of file: 'image', 'document', 'legal', 'sop'
 * @returns Upload path structure
 */
export function createUploadPath(filename: string, fileType: 'image' | 'document' | 'legal' | 'sop' = 'document'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  switch (fileType) {
    case 'image':
      return `images/${year}/${month}/${day}/${filename}`;
    case 'legal':
      return `legal-documents/${filename}`;
    case 'sop':
      return `sop-documents/${filename}`;
    case 'document':
    default:
      return `documents/${year}/${month}/${day}/${filename}`;
  }
}