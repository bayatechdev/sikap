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
 * Construct full file path from relative path stored in database
 * @param relativePath - The relative path stored in database (e.g., "2024/01/15/abc123.pdf")
 * @returns Full absolute path to the file
 */
export function getFullFilePath(relativePath: string): string {
  const uploadDir = getUploadDir();
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
 */
export async function ensureUploadDir(relativePath?: string): Promise<string> {
  const { mkdir } = await import('fs/promises');
  const { existsSync } = await import('fs');

  let targetDir = getUploadDir();

  if (relativePath) {
    targetDir = path.join(targetDir, path.dirname(relativePath));
  }

  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }

  return targetDir;
}