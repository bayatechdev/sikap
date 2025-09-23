'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FilePickerProps {
  documentType: string;
  label: string;
  required?: boolean;
  onFileSelect: (file: File, documentType: string) => void;
  onFileRemove: (documentType: string) => void;
  selectedFile?: File | null;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
  uploaded?: boolean;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
}

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_SIZE_MB = 5;

export function FilePicker({
  documentType,
  label,
  required = false,
  onFileSelect,
  onFileRemove,
  selectedFile,
  isUploading = false,
  uploadProgress = 0,
  error,
  uploaded = false,
  className,
  maxSizeMB = MAX_SIZE_MB,
}: FilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
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
      alert(validationError);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    onFileSelect(file, documentType);
  };

  const handleRemoveFile = () => {
    onFileRemove(documentType);
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
        return '/assets/images/icons/ic_document.svg';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '/assets/images/icons/ic_document.svg';
      default:
        return '/assets/images/icons/ic_document.svg';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!selectedFile && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            required={required && !selectedFile}
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
      )}

      {selectedFile && (
        <div className={cn(
          'bg-gray-50 rounded-lg p-4',
          uploaded && 'bg-green-50 border border-green-200',
          error && 'bg-red-50 border border-red-200'
        )}>
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
              {uploaded && (
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/images/icons/ic_check.svg"
                    alt="Uploaded"
                    width={16}
                    height={16}
                    className="text-green-600"
                  />
                  <span className="text-xs font-medium text-green-600">Uploaded</span>
                </div>
              )}

              {!isUploading && !uploaded && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Image
              src="/assets/images/icons/ic_close.svg"
              alt="Error"
              width={16}
              height={16}
              className="text-red-500"
            />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Supported formats: PDF, DOC, DOCX. Maximum file size: {maxSizeMB}MB.
      </p>
    </div>
  );
}