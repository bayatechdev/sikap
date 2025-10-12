'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { SlideForm } from './SlideForm';
import { SlideGrid } from './SlideGrid';
import { HeroSlide, HeroSlideAPI, EditingSlide } from '@/lib/hero-slide-api';
import {
  Plus,
  Loader2,
} from 'lucide-react';

interface HeroSlideManagerProps {
  slides: HeroSlide[];
  onSlidesChange: (slides: HeroSlide[]) => void;
  className?: string;
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
  const [reorderingSlideId, setReorderingSlideId] = useState<number | null>(null);
  const { toast } = useToast();

  // Refresh slides from API
  const refreshSlides = useCallback(async () => {
    try {
      const updatedSlides = await HeroSlideAPI.getAllSlides();
      onSlidesChange(updatedSlides);
    } catch (error) {
      console.error('Error refreshing slides:', error);
    }
  }, [onSlidesChange]);

  // Create new slide
  const handleCreateSlide = async (slideData: EditingSlide) => {
    try {
      setLoading(true);
      await HeroSlideAPI.createSlide(slideData);

      toast({
        title: 'Success',
        description: 'Hero slide created successfully',
      });

      await refreshSlides();
      setShowAddDialog(false);
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
    try {
      setLoading(true);
      await HeroSlideAPI.updateSlide(slideData);

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
      await HeroSlideAPI.deleteSlide(id);

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
      await HeroSlideAPI.toggleActive(slide.id, !slide.isActive);

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
      setReorderingSlideId(slide.id);
      console.log(`🔄 Starting reorder: ${slide.title || 'Slide ' + slide.id} ${direction}`);

      const updatedSlides = await HeroSlideAPI.reorderSlides(
        { id: slide.id, order: slide.order },
        { id: swapSlide.id, order: swapSlide.order }
      );

      // Update local state immediately for better UX
      onSlidesChange(updatedSlides);

      toast({
        title: 'Success',
        description: `Slide moved ${direction}`,
      });

      console.log(`✅ Reorder completed: ${slide.title || 'Slide ' + slide.id}`);
    } catch (error) {
      console.error('❌ Error reordering slide:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reorder slide',
        variant: 'destructive',
      });
    } finally {
      setReorderingSlideId(null);
    }
  };

  // Open edit dialog
  const openEditDialog = (slide: HeroSlide) => {
    const image = slide.imagesJson && slide.imagesJson[0];
    const editData: EditingSlide = {
      id: slide.id,
      version: slide.version,
      order: slide.order,
      isActive: slide.isActive,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      imageUrl: image?.url || '',
      imageAlt: image?.alt || '',
    };
    setEditingSlide(editData);
  };

  // Get next available order number
  const getNextOrder = () => {
    if (slides.length === 0) return 1;
    return Math.max(...slides.map(s => s.order)) + 1;
  };

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
              loading={loading}
              nextOrder={getNextOrder()}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Slides Grid */}
      <SlideGrid
        slides={slides}
        onEdit={openEditDialog}
        onToggleActive={handleToggleActive}
        onReorder={handleReorder}
        onDelete={setDeleteSlideId}
        reorderingSlideId={reorderingSlideId}
      />

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
              loading={loading}
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

// Re-export types for backward compatibility
export type { HeroSlide } from '@/lib/hero-slide-api';