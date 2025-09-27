'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, ImageIcon, Loader2, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  onUploadSuccess: (imageData: {
    url: string;
    filename: string;
    originalName: string;
    alt: string;
    title?: string;
  }) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  maxSizeMB?: number;
  accept?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
  dragActive: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
const DEFAULT_MAX_SIZE = 5; // MB

export function ImageUpload({
  onUploadSuccess,
  onUploadError,
  className,
  maxSizeMB = DEFAULT_MAX_SIZE,
  accept = 'image/*'
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    dragActive: false
  });

  // Form state for image metadata
  const [imageMetadata, setImageMetadata] = useState({
    alt: '',
    title: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const validateFile = useCallback((file: File): string | null => {
    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Only JPG, PNG, WebP, and AVIF images are allowed.';
    }

    return null;
  }, [maxSizeMB]);

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadState(prev => ({ ...prev, error }));
      if (onUploadError) onUploadError(error);
      return;
    }

    setSelectedFile(file);
    setUploadState(prev => ({ ...prev, error: undefined }));

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-fill alt text with filename (without extension)
    const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setImageMetadata(prev => ({
      ...prev,
      alt: prev.alt || filenameWithoutExt
    }));
  }, [validateFile, onUploadError]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, dragActive: false }));

    const files = e.dataTransfer.files;
    const file = files[0];

    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, dragActive: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, dragActive: false }));
  }, []);

  const uploadImage = async () => {
    if (!selectedFile || !imageMetadata.alt.trim()) {
      setUploadState(prev => ({ ...prev, error: 'Please select a file and provide alt text' }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: undefined
    }));

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      // Call success callback with image data including metadata
      onUploadSuccess({
        url: result.url,
        filename: result.filename,
        originalName: result.originalName,
        alt: imageMetadata.alt,
        title: imageMetadata.title || undefined
      });

      // Reset form
      resetForm();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState(prev => ({ ...prev, error: errorMessage }));
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploadState(prev => ({ ...prev, isUploading: false, progress: 0 }));
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setImageMetadata({ alt: '', title: '' });
    setUploadState({
      isUploading: false,
      progress: 0,
      dragActive: false
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* File Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          uploadState.dragActive
            ? 'border-primary bg-primary/10'
            : selectedFile
            ? 'border-green-300 bg-green-50'
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

        {selectedFile && previewUrl ? (
          <div className="space-y-4">
            <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{selectedFile.name}</p>
              <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {uploadState.dragActive ? (
                <Upload className="w-12 h-12 text-primary" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium">
                {uploadState.dragActive ? 'Drop image here' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG, WebP, AVIF up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadState.error}</AlertDescription>
        </Alert>
      )}

      {/* Image Metadata Form - Only show when file is selected */}
      {selectedFile && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium">Image Details</h4>

          <div>
            <Label htmlFor="alt-text">Alt Text *</Label>
            <Input
              id="alt-text"
              value={imageMetadata.alt}
              onChange={(e) => setImageMetadata(prev => ({ ...prev, alt: e.target.value }))}
              placeholder="Describe the image for accessibility"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for accessibility. Describe what&apos;s in the image.
            </p>
          </div>

          <div>
            <Label htmlFor="title-text">Title (Optional)</Label>
            <Input
              id="title-text"
              value={imageMetadata.title}
              onChange={(e) => setImageMetadata(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Image title for the slider"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional title displayed on the image in the slider.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={uploadImage}
              disabled={uploadState.isUploading || !imageMetadata.alt.trim()}
              className="flex-1"
            >
              {uploadState.isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={resetForm}
              disabled={uploadState.isUploading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}