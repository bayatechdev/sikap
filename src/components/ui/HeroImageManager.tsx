'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from './ImageUpload';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  AlertCircle
} from 'lucide-react';

export interface HeroImage {
  url: string;
  alt: string;
  title?: string;
}

interface HeroImageManagerProps {
  images: HeroImage[];
  onImagesChange: (images: HeroImage[]) => void;
  className?: string;
}

interface EditingImage extends HeroImage {
  index: number;
}

export function HeroImageManager({
  images,
  onImagesChange,
  className
}: HeroImageManagerProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [editingImage, setEditingImage] = useState<EditingImage | null>(null);

  // Add new image
  const handleImageUpload = useCallback((imageData: {
    url: string;
    filename: string;
    originalName: string;
    alt: string;
    title?: string;
  }) => {
    const newImage: HeroImage = {
      url: imageData.url,
      alt: imageData.alt,
      title: imageData.title
    };

    onImagesChange([...images, newImage]);
    setShowUpload(false);
  }, [images, onImagesChange]);

  // Delete image
  const handleDeleteImage = useCallback(async (index: number) => {
    const imageToDelete = images[index];

    // Delete from filesystem if it's an uploaded image
    if (imageToDelete.url.startsWith('/uploads/')) {
      const filename = imageToDelete.url.split('/').pop();
      if (filename) {
        try {
          await fetch(`/api/upload/image?filename=${filename}`, {
            method: 'DELETE'
          });
        } catch (error) {
          console.warn('Failed to delete image file:', error);
        }
      }
    }

    // Remove from images array
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  // Edit image metadata
  const handleEditImage = useCallback((updatedImage: EditingImage) => {
    const newImages = [...images];
    newImages[updatedImage.index] = {
      url: updatedImage.url,
      alt: updatedImage.alt,
      title: updatedImage.title
    };
    onImagesChange(newImages);
    setEditingImage(null);
  }, [images, onImagesChange]);

  // Move image up
  const moveImageUp = useCallback((index: number) => {
    if (index === 0) return;

    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  // Move image down
  const moveImageDown = useCallback((index: number) => {
    if (index === images.length - 1) return;

    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Hero Images</h3>
          <p className="text-sm text-gray-600">
            Manage images for the hero slider. Images will be displayed in the order shown below.
          </p>
        </div>
        <Badge variant="secondary">
          {images.length} image{images.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Images Grid */}
      <div className="space-y-4">
        {images.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center mb-4">
                No hero images yet. Add your first image to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          images.map((image, index) => (
            <Card key={`${image.url}-${index}`} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image Preview */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>

                  {/* Image Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">
                          {image.title || image.alt}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {image.alt}
                        </p>
                        {image.title && image.title !== image.alt && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            Alt: {image.alt}
                          </p>
                        )}
                      </div>

                      {/* Order Badge */}
                      <Badge variant="outline" className="ml-2">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {/* Move buttons */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveImageUp(index)}
                        disabled={index === 0}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveImageDown(index)}
                        disabled={index === images.length - 1}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Edit, Preview, Delete buttons */}
                    <div className="flex gap-1">
                      {/* Preview */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="p-1 h-8 w-8"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{image.title || image.alt}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="relative w-full h-80 rounded-lg overflow-hidden">
                              <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="space-y-2">
                              <p><span className="font-medium">Alt Text:</span> {image.alt}</p>
                              {image.title && (
                                <p><span className="font-medium">Title:</span> {image.title}</p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Edit */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="p-1 h-8 w-8"
                            onClick={() => setEditingImage({ ...image, index })}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Image Details</DialogTitle>
                          </DialogHeader>
                          {editingImage && (
                            <EditImageForm
                              image={editingImage}
                              onSave={handleEditImage}
                              onCancel={() => setEditingImage(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteImage(index)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add New Image */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          {showUpload ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add New Hero Image</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </Button>
              </div>
              <ImageUpload
                onUploadSuccess={handleImageUpload}
                onUploadError={(error) => console.error('Upload error:', error)}
              />
            </div>
          ) : (
            <div className="text-center">
              <Button
                onClick={() => setShowUpload(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tips:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Use high-quality images (recommended: 1200x600px or larger)</li>
            <li>Images will auto-advance every 6 seconds in the slider</li>
            <li>Use the order buttons (↑↓) to rearrange images</li>
            <li>Alt text is important for accessibility</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Edit Image Form Component
function EditImageForm({
  image,
  onSave,
  onCancel
}: {
  image: EditingImage;
  onSave: (image: EditingImage) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    alt: image.alt,
    title: image.title || ''
  });

  const handleSave = () => {
    if (!formData.alt.trim()) {
      return;
    }

    onSave({
      ...image,
      alt: formData.alt,
      title: formData.title || undefined
    });
  };

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          className="object-cover"
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="edit-alt">Alt Text *</Label>
          <Input
            id="edit-alt"
            value={formData.alt}
            onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
            placeholder="Describe the image"
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for accessibility
          </p>
        </div>

        <div>
          <Label htmlFor="edit-title">Title (Optional)</Label>
          <Input
            id="edit-title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Optional title for the slider"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!formData.alt.trim()}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}