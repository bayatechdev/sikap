'use client';

import { HeroSlide } from '@/lib/hero-slide-api';
import { SlideCard } from './SlideCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SlideGridProps {
  slides: HeroSlide[];
  onEdit: (slide: HeroSlide) => void;
  onToggleActive: (slide: HeroSlide) => void;
  onReorder: (slide: HeroSlide, direction: 'up' | 'down') => void;
  onDelete: (id: number) => void;
  reorderingSlideId?: number | null;
  className?: string;
}

export function SlideGrid({
  slides,
  onEdit,
  onToggleActive,
  onReorder,
  onDelete,
  reorderingSlideId,
  className
}: SlideGridProps) {
  // Sort slides by order
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  if (sortedSlides.length === 0) {
    return (
      <Alert className={className}>
        <AlertDescription>
          No hero slides yet. Click &ldquo;Add Slide&rdquo; to create your first slide.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {sortedSlides.map((slide, index) => (
        <SlideCard
          key={slide.id}
          slide={slide}
          index={index}
          totalSlides={sortedSlides.length}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onReorder={onReorder}
          onDelete={onDelete}
          isReordering={reorderingSlideId === slide.id}
        />
      ))}
    </div>
  );
}