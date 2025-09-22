'use client';

import React, { useState, useRef } from 'react';
import { useUploadDocument } from '@/hooks/use-documents';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UploadedDocument {
  id: string;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
}

interface FileUploadProps {
  applicationId?: string;
  documentType: string;
  label: string;
  required?: boolean;
  onUploadSuccess?: (document: UploadedDocument) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  accept?: string;
  acceptedTypes?: string[];
  maxSize?: number;
  maxSizeMB?: number;
}

interface UploadStatus {
  isUploading: boolean;
  progress: number;
  error?: string;
  success?: boolean;
}

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_SIZE_MB = 5;

export function SecureFileUpload({
  applicationId,
  documentType,
  label,
  required = false,
  onUploadSuccess,
  onUploadError,
  className,
  acceptedTypes = ALLOWED_TYPES,
  maxSizeMB = MAX_SIZE_MB,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
  });
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocument();

  const validateFile = (file: File): string | null => {
    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Type validation
    if (!acceptedTypes.includes(file.type)) {
      return 'File type not supported. Please use PDF, DOC, or DOCX files.';
    }

    // Extension validation
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return 'File extension not allowed. Please use .pdf, .doc, or .docx files.';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus({
        isUploading: false,
        progress: 0,
        error: validationError,
      });
      setSelectedFile(null);
      onUploadError?.(validationError);
      return;
    }

    setSelectedFile(file);
    setUploadStatus({
      isUploading: false,
      progress: 0,
      error: undefined,
      success: false,
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !applicationId) return;

    setUploadStatus({
      isUploading: true,
      progress: 0,
      error: undefined,
    });

    try {
      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        applicationId,
        documentType,
      });

      setUploadStatus({
        isUploading: false,
        progress: 100,
        success: true,
      });

      setUploadedDocument(result.document as unknown as UploadedDocument);
      onUploadSuccess?.(result.document as unknown as UploadedDocument);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      });
      onUploadError?.(errorMessage);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus({
      isUploading: false,
      progress: 0,
      error: undefined,
      success: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    switch (mimeType) {
      case 'application/pdf':
        return '/assets/images/icons/ic_pdf.svg';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '/assets/images/icons/ic_doc.svg';
      default:
        return '/assets/images/icons/ic_file.svg';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!uploadedDocument && (
        <div className="space-y-3">
          {/* File Input */}
          <div
            className={cn(
              'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              uploadStatus.error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400',
              uploadStatus.isUploading && 'pointer-events-none opacity-50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileSelect}
              disabled={uploadStatus.isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required={required && !uploadedDocument}
            />

            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image
                  src="/assets/images/icons/ic_upload.svg"
                  alt="Upload"
                  width={24}
                  height={24}
                  className="text-gray-400"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX up to {maxSizeMB}MB
                </p>
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image
                    src={getFileIcon(selectedFile.type)}
                    alt="File"
                    width={20}
                    height={20}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!uploadStatus.isUploading && (
                    <>
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!applicationId || uploadStatus.isUploading}
                        className="px-3 py-1 text-xs font-medium text-white bg-primary rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {uploadStatus.isUploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadStatus.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadStatus.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Uploaded Document */}
      {uploadedDocument && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Image
                src="/assets/images/icons/ic_check.svg"
                alt="Success"
                width={20}
                height={20}
                className="text-green-600"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                File uploaded successfully
              </p>
              <p className="text-xs text-green-700">
                {uploadedDocument.originalFilename} • {formatFileSize(uploadedDocument.fileSize)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUploadedDocument(null);
                setUploadStatus({
                  isUploading: false,
                  progress: 0,
                  success: false,
                });
              }}
              className="text-xs text-green-600 hover:text-green-800"
            >
              Upload Again
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadStatus.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Image
              src="/assets/images/icons/ic_close.svg"
              alt="Error"
              width={16}
              height={16}
              className="text-red-500"
            />
            <p className="text-sm text-red-700">{uploadStatus.error}</p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Supported formats: PDF, DOC, DOCX. Maximum file size: {maxSizeMB}MB. Files are automatically scanned for security.
      </p>
    </div>
  );
}