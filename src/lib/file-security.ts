import crypto from 'crypto';
import { sanitizeFilename } from './utils';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
  detectedMimeType?: string;
}

export interface VirusScanResult {
  isClean: boolean;
  threat?: string;
  scanTime: Date;
}

// File type configurations
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Magic number signatures for file validation
const FILE_SIGNATURES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'application/msword': [0xD0, 0xCF, 0x11, 0xE0], // MS Office legacy
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04], // ZIP/DOCX
  'image/jpeg': [0xFF, 0xD8, 0xFF], // JPEG
  'image/png': [0x89, 0x50, 0x4E, 0x47], // PNG
};

/**
 * Validate file based on multiple security checks
 */
export function validateFile(
  buffer: Buffer,
  originalFilename: string,
  declaredMimeType: string
): FileValidationResult {
  try {
    // 1. File size validation
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      };
    }

    // 2. Extension validation
    const extension = originalFilename.toLowerCase().substring(originalFilename.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: `File extension ${extension} is not allowed`,
      };
    }

    // 3. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(declaredMimeType)) {
      return {
        isValid: false,
        error: `MIME type ${declaredMimeType} is not allowed`,
      };
    }

    // 4. Magic number validation
    const detectedMimeType = detectMimeTypeFromSignature(buffer);
    if (!detectedMimeType) {
      return {
        isValid: false,
        error: 'Could not detect valid file signature',
      };
    }

    // 5. MIME type consistency check
    if (!isMimeTypeConsistent(declaredMimeType, detectedMimeType, extension)) {
      return {
        isValid: false,
        error: 'File signature does not match declared type',
      };
    }

    // 6. Content validation
    const contentValidation = validateFileContent(buffer, detectedMimeType);
    if (!contentValidation.isValid) {
      return contentValidation;
    }

    // 7. Generate secure filename
    const sanitizedFilename = generateSecureFilename(originalFilename);

    return {
      isValid: true,
      sanitizedFilename,
      detectedMimeType,
    };

  } catch {
    return {
      isValid: false,
      error: 'File validation failed due to processing error',
    };
  }
}

/**
 * Detect MIME type from file signature (magic numbers)
 */
export function detectMimeTypeFromSignature(buffer: Buffer): string | null {
  for (const [mimeType, signature] of Object.entries(FILE_SIGNATURES)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      return mimeType;
    }
  }
  return null;
}

/**
 * Check if MIME types are consistent
 */
function isMimeTypeConsistent(
  declaredMimeType: string,
  detectedMimeType: string,
  extension: string
): boolean {
  // Direct match
  if (declaredMimeType === detectedMimeType) {
    return true;
  }

  // Handle JPEG variations
  if (
    (declaredMimeType === 'image/jpeg' || declaredMimeType === 'image/jpg') &&
    (detectedMimeType === 'image/jpeg' || detectedMimeType === 'image/jpg')
  ) {
    return true;
  }

  // Handle Office document variations
  if (
    extension === '.docx' &&
    detectedMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return true;
  }

  return false;
}

/**
 * Validate file content structure
 */
function validateFileContent(buffer: Buffer, mimeType: string): FileValidationResult {
  try {
    switch (mimeType) {
      case 'application/pdf':
        return validatePDFContent(buffer);

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return validateDocxContent(buffer);

      case 'image/jpeg':
      case 'image/jpg':
        return validateJPEGContent(buffer);

      case 'image/png':
        return validatePNGContent(buffer);

      default:
        return { isValid: true };
    }
  } catch {
    return {
      isValid: false,
      error: 'Content validation failed',
    };
  }
}

/**
 * Validate PDF content structure
 */
function validatePDFContent(buffer: Buffer): FileValidationResult {
  const pdfHeader = buffer.toString('ascii', 0, 8);
  if (!pdfHeader.startsWith('%PDF-')) {
    return {
      isValid: false,
      error: 'Invalid PDF file structure',
    };
  }

  // Check for PDF trailer
  const content = buffer.toString('ascii');
  if (!content.includes('%%EOF')) {
    return {
      isValid: false,
      error: 'PDF file appears to be corrupted or incomplete',
    };
  }

  return { isValid: true };
}

/**
 * Validate DOCX content structure
 */
function validateDocxContent(buffer: Buffer): FileValidationResult {
  // DOCX is a ZIP archive, check for proper ZIP structure
  const zipSignature = [0x50, 0x4B, 0x03, 0x04];
  const hasValidZipSignature = zipSignature.every((byte, index) => buffer[index] === byte);

  if (!hasValidZipSignature) {
    return {
      isValid: false,
      error: 'Invalid DOCX file structure',
    };
  }

  return { isValid: true };
}

/**
 * Validate JPEG content structure
 */
function validateJPEGContent(buffer: Buffer): FileValidationResult {
  // JPEG should start with FFD8 and end with FFD9
  if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
    return {
      isValid: false,
      error: 'Invalid JPEG file structure',
    };
  }

  // Check for valid JPEG end marker
  const endMarker = buffer.subarray(-2);
  if (endMarker[0] !== 0xFF || endMarker[1] !== 0xD9) {
    return {
      isValid: false,
      error: 'JPEG file appears to be corrupted or incomplete',
    };
  }

  return { isValid: true };
}

/**
 * Validate PNG content structure
 */
function validatePNGContent(buffer: Buffer): FileValidationResult {
  // PNG signature: 89504E47 0D0A1A0A
  const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  const hasValidSignature = pngSignature.every((byte, index) => buffer[index] === byte);

  if (!hasValidSignature) {
    return {
      isValid: false,
      error: 'Invalid PNG file structure',
    };
  }

  return { isValid: true };
}

/**
 * Generate secure filename with timestamp and random string
 */
export function generateSecureFilename(originalFilename: string): string {
  const extension = originalFilename.toLowerCase().substring(originalFilename.lastIndexOf('.'));
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const sanitized = sanitizeFilename(originalFilename.replace(extension, ''));

  return `${timestamp}_${randomString}_${sanitized}${extension}`;
}

/**
 * Calculate file hash for integrity verification
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Mock virus scanning function
 * In production, this would integrate with ClamAV or similar
 */
export async function performVirusScan(buffer: Buffer): Promise<VirusScanResult> {
  // Simulate virus scanning delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock malicious patterns (in real implementation, this would be handled by antivirus)
  const content = buffer.toString('hex').toLowerCase();
  const maliciousPatterns = [
    'x5o!p%@ap[4\\pzx54(p^)7cc)7}$eicar-standard-antivirus-test-file!$h+h*', // EICAR test string
    'javascript:', // Potential XSS
    '<script', // Script injection
    'eval(', // Code evaluation
  ];

  for (const pattern of maliciousPatterns) {
    if (content.includes(Buffer.from(pattern).toString('hex'))) {
      return {
        isClean: false,
        threat: 'Malicious content detected',
        scanTime: new Date(),
      };
    }
  }

  return {
    isClean: true,
    scanTime: new Date(),
  };
}

/**
 * Create secure upload directory path
 */
export function createUploadPath(filename: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `uploads/${year}/${month}/${day}/${filename}`;
}