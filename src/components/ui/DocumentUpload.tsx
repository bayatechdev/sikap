'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, AlertCircle, Download, Trash2 } from 'lucide-react';

interface DocumentUploadProps {
  onUploadSuccess: (documentData: {
    fileName: string;
    fileSize: string;
    fileType: string;
    relativePath: string;
    originalName: string;
  }) => void;
  onUploadError?: (error: string) => void;
  onRemoveDocument?: () => void;
  className?: string;
  maxSizeMB?: number;
  cooperationTypeId?: number;
  existingDocument?: {
    fileName: string;
    fileSize: string;
    fileType: string;
    relativePath: string;
    originalName: string;
  };
  accept?: string;
  customUploadFunction?: (file: File) => Promise<{
    fileName: string;
    fileSize: string;
    fileType: string;
    relativePath: string;
    originalName: string;
  }>;
  uploadType?: 'cooperation-type-document' | 'legal-document';
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
  dragActive: boolean;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const DEFAULT_MAX_SIZE = 10; // MB

export function DocumentUpload({
  onUploadSuccess,
  onUploadError,
  onRemoveDocument,
  className,
  maxSizeMB = DEFAULT_MAX_SIZE,
  cooperationTypeId,
  existingDocument,
  accept = '.pdf,.doc,.docx',
  customUploadFunction,
  uploadType = 'cooperation-type-document'
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    dragActive: false
  });

  const validateFile = useCallback((file: File): string | null => {
    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.';
    }

    // Check MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.';
    }

    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  }, [maxSizeMB]);

  const uploadDocument = useCallback(async (file: File) => {
    console.log('🚀 Starting document upload:', { fileName: file.name, fileSize: file.size, uploadType });

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: undefined
    }));

    try {
      let result;

      // Use custom upload function if provided, otherwise use default
      if (customUploadFunction) {
        console.log('📤 Using custom upload function');
        result = await customUploadFunction(file);
      } else {
        console.log('📤 Using default upload function with type:', uploadType);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', uploadType);
        if (cooperationTypeId && uploadType === 'cooperation-type-document') {
          formData.append('cooperationTypeId', cooperationTypeId.toString());
        }

        const uploadUrl = uploadType === 'legal-document'
          ? '/api/legal-documents/upload'
          : '/api/cooperation-types/documents/upload';

        console.log('📤 Uploading to:', uploadUrl);
        console.log('📤 Form data:', {
          fileName: file.name,
          fileSize: file.size,
          type: uploadType,
          cooperationTypeId: cooperationTypeId
        });

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData
        });

        console.log('📤 Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Upload failed:', errorData);
          throw new Error(errorData.error || 'Upload failed');
        }

        const apiResult = await response.json();
        console.log('✅ Upload API response:', apiResult);

        // Format file size
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1);
        const fileSize = `${fileSizeInMB}MB`;

        result = {
          fileName: apiResult.fileName || file.name,
          fileSize: fileSize,
          fileType: file.type === 'application/pdf' ? 'PDF' :
                   file.type.includes('word') ? 'DOCX' : 'DOC',
          relativePath: apiResult.relativePath,
          originalName: file.name
        };

        console.log('✅ Formatted result:', result);
      }

      // Call success callback with document data
      console.log('🎉 Calling onUploadSuccess with:', result);
      onUploadSuccess(result);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error('❌ Upload error:', errorMessage);
      setUploadState(prev => ({ ...prev, error: errorMessage }));
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploadState(prev => ({ ...prev, isUploading: false, progress: 0 }));
    }
  }, [cooperationTypeId, onUploadSuccess, onUploadError, customUploadFunction, uploadType]);

  const handleFileSelect = useCallback((file: File) => {
    console.log('📂 File selected:', file.name);
    const error = validateFile(file);
    if (error) {
      console.log('❌ File validation failed:', error);
      setUploadState(prev => ({ ...prev, error }));
      if (onUploadError) onUploadError(error);
      return;
    }

    console.log('✅ File validation passed, starting upload');
    uploadDocument(file);
  }, [validateFile, onUploadError, uploadDocument]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    console.log('🎯 File dropped on upload area');
    e.preventDefault();
    setUploadState(prev => ({ ...prev, dragActive: false }));

    const files = e.dataTransfer.files;
    const file = files[0];
    console.log('📂 Files dropped:', files.length, 'First file:', file?.name);

    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    console.log('🎯 Drag over event');
    e.preventDefault();
    setUploadState(prev => ({ ...prev, dragActive: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    console.log('🎯 Drag leave event');
    e.preventDefault();
    setUploadState(prev => ({ ...prev, dragActive: false }));
  }, []);

  const handleRemoveDocument = () => {
    if (onRemoveDocument) {
      onRemoveDocument();
    }
  };

  const openFileDialog = () => {
    console.log('🖱️ Opening file dialog');
    fileInputRef.current?.click();
  };

  const formatFileSize = (size: string) => {
    // If it's already formatted, return as is
    if (size.includes('MB') || size.includes('KB')) {
      return size;
    }

    // If it's just a number, format it
    const numSize = parseFloat(size);
    if (numSize > 1024 * 1024) {
      return `${(numSize / (1024 * 1024)).toFixed(1)}MB`;
    } else if (numSize > 1024) {
      return `${(numSize / 1024).toFixed(1)}KB`;
    }
    return `${numSize}B`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {existingDocument ? (
        // Show existing document
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {existingDocument.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {existingDocument.fileType} • {formatFileSize(existingDocument.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {existingDocument.relativePath && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open document in new window for download
                      window.open(`/api/files/${existingDocument.relativePath}`, '_blank');
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveDocument}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Show upload area
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            uploadState.dragActive
              ? 'border-primary bg-primary/10'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {uploadState.dragActive ? (
                <Upload className="w-12 h-12 text-primary" />
              ) : (
                <FileText className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium">
                {uploadState.isUploading ? 'Uploading...' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-sm text-gray-500">
                PDF, DOC, DOCX up to {maxSizeMB}MB
              </p>
            </div>
          </div>

          {uploadState.isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {uploadState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadState.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}