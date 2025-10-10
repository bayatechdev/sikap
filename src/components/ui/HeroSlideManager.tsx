'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ImageUpload } from './ImageUpload';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Columns2,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from 'lucide-react';

export interface HeroSlide {
  id: number;
  version: 'split' | 'full';
  order: number;
  isActive: boolean;
  title: string | null;
  subtitle: string | null;
  imagesJson: Array<{
    url: string;
    alt?: string;
  }> | null;
  createdAt: string;
  updatedAt: string;
}

interface HeroSlideManagerProps {
  slides: HeroSlide[];
  onSlidesChange: (slides: HeroSlide[]) => void;
  className?: string;
}

interface EditingSlide {
  id?: number;
  version: 'split' | 'full';
  order: number;
  isActive: boolean;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
}

export function HeroSlideManager({
  slides,
  onSlidesChange,
  className
}: HeroSlideManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSlide, setEditingSlide] = useState<EditingSlide | null>(null);
  const [deleteSlideId, setDeleteSlideId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Refresh slides from API
  const refreshSlides = useCallback(async () => {
    try {
      const response = await fetch('/api/hero-slides');
      const data = await response.json();
      if (data.success) {
        onSlidesChange(data.heroSlides);
      }
    } catch (error) {
      console.error('Error refreshing slides:', error);
    }
  }, [onSlidesChange]);

  // Create new slide
  const handleCreateSlide = async (slideData: EditingSlide) => {
    try {
      setLoading(true);

      const payload = {
        version: slideData.version,
        order: slideData.order,
        isActive: slideData.isActive,
        title: slideData.title || null,
        subtitle: slideData.subtitle || null,
        imagesJson: [{
          url: slideData.imageUrl,
          alt: slideData.imageAlt || slideData.title
        }]
      };

      const response = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create slide');
      }

      toast({
        title: 'Success',
        description: 'Hero slide created successfully',
      });

      await refreshSlides();
      setShowAddDialog(false);
      setEditingSlide(null);
    } catch (error) {
      console.error('Error creating slide:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create slide',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update slide
  const handleUpdateSlide = async (slideData: EditingSlide) => {
    if (!slideData.id) return;

    try {
      setLoading(true);

      const payload = {
        version: slideData.version,
        order: slideData.order,
        isActive: slideData.isActive,
        title: slideData.title || null,
        subtitle: slideData.subtitle || null,
        imagesJson: [{
          url: slideData.imageUrl,
          alt: slideData.imageAlt || slideData.title
        }]
      };

      const response = await fetch(`/api/hero-slides/${slideData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update slide');
      }

      toast({
        title: 'Success',
        description: 'Hero slide updated successfully',
      });

      await refreshSlides();
      setEditingSlide(null);
    } catch (error) {
      console.error('Error updating slide:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update slide',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete slide
  const handleDeleteSlide = async (id: number) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/hero-slides/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete slide');
      }

      toast({
        title: 'Success',
        description: 'Hero slide deleted successfully',
      });

      await refreshSlides();
      setDeleteSlideId(null);
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete slide',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const response = await fetch(`/api/hero-slides/${slide.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle slide status');
      }

      toast({
        title: 'Success',
        description: `Slide ${!slide.isActive ? 'activated' : 'deactivated'}`,
      });

      await refreshSlides();
    } catch (error) {
      console.error('Error toggling slide:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle slide status',
        variant: 'destructive',
      });
    }
  };

  // Reorder slide (move up/down)
  const handleReorder = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const sortedSlides = [...slides].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSlides.findIndex(s => s.id === slide.id);

    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedSlides.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapSlide = sortedSlides[swapIndex];

    try {
      // Swap orders
      const updates = [
        fetch(`/api/hero-slides/${slide.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: swapSlide.order }),
        }),
        fetch(`/api/hero-slides/${swapSlide.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: slide.order }),
        }),
      ];

      await Promise.all(updates);

      toast({
        title: 'Success',
        description: 'Slide order updated',
      });

      await refreshSlides();
    } catch (error) {
      console.error('Error reordering slide:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder slide',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (slide: HeroSlide) => {
    const image = slide.imagesJson && slide.imagesJson[0];
    setEditingSlide({
      id: slide.id,
      version: slide.version,
      order: slide.order,
      isActive: slide.isActive,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      imageUrl: image?.url || '',
      imageAlt: image?.alt || '',
    });
  };

  // Get next available order number
  const getNextOrder = () => {
    if (slides.length === 0) return 1;
    return Math.max(...slides.map(s => s.order)) + 1;
  };

  // Slide Form Component
  const SlideForm = ({ slide, onSave, onCancel }: {
    slide: EditingSlide | null;
    onSave: (data: EditingSlide) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<EditingSlide>(slide || {
      version: 'split',
      order: getNextOrder(),
      isActive: true,
      title: '',
      subtitle: '',
      imageUrl: '',
      imageAlt: '',
    });

    const handleImageUpload = (imageData: {
      url: string;
      filename: string;
      originalName: string;
      alt: string;
    }) => {
      setFormData(prev => ({
        ...prev,
        imageUrl: imageData.url,
        imageAlt: imageData.alt || prev.title,
      }));
    };

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

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Version Selection */}
        <div className="space-y-2">
          <Label>Layout Version</Label>
          <RadioGroup
            value={formData.version}
            onValueChange={(value: 'split' | 'full') => setFormData(prev => ({ ...prev, version: value }))}
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
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', imageAlt: '' }))}
              >
                Remove
              </Button>
            </div>
          ) : (
            <ImageUpload
              onImageUploaded={handleImageUpload}
              buttonText="Upload Image"
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
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
          />
        </div>

        {/* Title (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="title">Custom Title (Optional)</Label>
          <Input
            id="title"
            placeholder="Leave empty to use global title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        {/* Subtitle (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Custom Subtitle (Optional)</Label>
          <Textarea
            id="subtitle"
            placeholder="Leave empty to use global subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
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
  };

  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Hero Slides</h3>
          <p className="text-sm text-muted-foreground">
            Manage your hero carousel slides. Each slide can be split or full layout.
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Hero Slide</DialogTitle>
            </DialogHeader>
            <SlideForm
              slide={null}
              onSave={handleCreateSlide}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Slides Grid */}
      {sortedSlides.length === 0 ? (
        <Alert>
          <AlertDescription>
            No hero slides yet. Click "Add Slide" to create your first slide.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSlides.map((slide, index) => {
            const image = slide.imagesJson && slide.imagesJson[0];
            return (
              <Card key={slide.id} className={cn(!slide.isActive && 'opacity-60')}>
                <CardContent className="p-4 space-y-3">
                  {/* Image Preview */}
                  <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                    {image?.url ? (
                      <Image
                        src={image.url}
                        alt={image.alt || 'Slide image'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Slide Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={slide.version === 'split' ? 'default' : 'secondary'}>
                        {slide.version === 'split' ? (
                          <><Columns2 className="mr-1 h-3 w-3" /> Split</>
                        ) : (
                          <><Maximize2 className="mr-1 h-3 w-3" /> Full</>
                        )}
                      </Badge>
                      <Badge variant="outline">Order: {slide.order}</Badge>
                      <Badge variant={slide.isActive ? 'default' : 'secondary'}>
                        {slide.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Badge>
                    </div>

                    {slide.title && (
                      <p className="text-sm font-medium line-clamp-1">{slide.title}</p>
                    )}
                    {slide.subtitle && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{slide.subtitle}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEditDialog(slide)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(slide)}
                    >
                      {slide.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder(slide, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder(slide, 'down')}
                      disabled={index === sortedSlides.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteSlideId(slide.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingSlide} onOpenChange={(open) => !open && setEditingSlide(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hero Slide</DialogTitle>
          </DialogHeader>
          {editingSlide && (
            <SlideForm
              slide={editingSlide}
              onSave={handleUpdateSlide}
              onCancel={() => setEditingSlide(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSlideId} onOpenChange={(open) => !open && setDeleteSlideId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Slide?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hero slide.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSlideId && handleDeleteSlide(deleteSlideId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
