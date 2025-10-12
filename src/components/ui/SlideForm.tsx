'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DialogFooter } from '@/components/ui/dialog';
import { ImageUpload } from './ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { EditingSlide } from '@/lib/hero-slide-api';
import {
  Maximize2,
  Columns2,
  Save,
  Loader2,
} from 'lucide-react';

interface SlideFormProps {
  slide: EditingSlide | null;
  onSave: (data: EditingSlide) => void;
  onCancel: () => void;
  loading?: boolean;
  nextOrder?: number;
}

export function SlideForm({ slide, onSave, onCancel, loading = false, nextOrder }: SlideFormProps) {
  const { toast } = useToast();

  // Track initialization to prevent state resets
  const hasLoadedFromSlide = useRef(false);
  const isInitialized = useRef(false);

  // Initialize form data - use stable state initialization
  const [formData, setFormData] = useState<EditingSlide>(() => {
    isInitialized.current = true;

    if (slide) {
      // For editing existing slide
      hasLoadedFromSlide.current = true;
      return { ...slide };
    } else {
      // For new slide - use provided nextOrder or default to 1
      return {
        version: 'split' as const,
        order: nextOrder || 1,
        isActive: true,
        title: '',
        subtitle: '',
        imageUrl: '',
        imageAlt: '',
      };
    }
  });

  // Sync form data when slide prop changes (for edit dialog)
  useEffect(() => {
    if (slide && !hasLoadedFromSlide.current) {
      setFormData({ ...slide });
      hasLoadedFromSlide.current = true;
    } else if (!slide && isInitialized.current) {
      // Reset for new slide - keep existing form state
      hasLoadedFromSlide.current = false;
    }
  }, [slide?.id, slide]);

  // Handle image upload with stable state updates
  const handleImageUpload = (imageData: {
    url: string;
    filename: string;
    originalName: string;
    alt: string;
  }) => {
    setFormData(prev => {
      // Prevent duplicate update if URL already exists
      if (prev.imageUrl === imageData.url) {
        return prev;
      }

      return {
        ...prev,
        imageUrl: imageData.url,
        imageAlt: imageData.alt || prev.title,
      };
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      toast({
        title: 'Error',
        description: 'Please upload an image',
        variant: 'destructive',
      });
      return;
    }

    onSave(formData);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
      imageAlt: ''
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Version Selection */}
      <div className="space-y-2">
        <Label>Layout Version</Label>
        <RadioGroup
          value={formData.version}
          onValueChange={(value: 'split' | 'full') =>
            setFormData(prev => ({ ...prev, version: value }))
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="split" id="split" />
            <Label htmlFor="split" className="flex items-center gap-2 cursor-pointer">
              <Columns2 className="h-4 w-4" />
              Split Layout (2 Columns)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="full" />
            <Label htmlFor="full" className="flex items-center gap-2 cursor-pointer">
              <Maximize2 className="h-4 w-4" />
              Full Slider (Fullscreen)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Slide Image *</Label>
        {formData.imageUrl ? (
          <div className="relative w-full h-40 border rounded-md overflow-hidden">
            <Image
              src={formData.imageUrl}
              alt={formData.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              Remove
            </Button>
          </div>
        ) : (
          <ImageUpload
            onUploadSuccess={handleImageUpload}
            className="w-full"
          />
        )}
      </div>

      {/* Order */}
      <div className="space-y-2">
        <Label htmlFor="order">Order (Position)</Label>
        <Input
          id="order"
          type="number"
          min="1"
          value={formData.order}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              order: parseInt(e.target.value) || 1
            }))
          }
        />
      </div>

      {/* Title (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="title">Custom Title (Optional)</Label>
        <Input
          id="title"
          placeholder="Leave empty to use global title"
          value={formData.title}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, title: e.target.value }))
          }
        />
      </div>

      {/* Subtitle (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="subtitle">Custom Subtitle (Optional)</Label>
        <Textarea
          id="subtitle"
          placeholder="Leave empty to use global subtitle"
          value={formData.subtitle}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, subtitle: e.target.value }))
          }
          rows={3}
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData(prev => ({ ...prev, isActive: checked }))
          }
        />
        <Label htmlFor="isActive">Active (Show on website)</Label>
      </div>

      {/* Actions */}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Slide
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}