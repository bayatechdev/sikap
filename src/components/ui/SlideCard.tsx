'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroSlide } from '@/lib/hero-slide-api';
import {
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Columns2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

interface SlideCardProps {
  slide: HeroSlide;
  index: number;
  totalSlides: number;
  onEdit: (slide: HeroSlide) => void;
  onToggleActive: (slide: HeroSlide) => void;
  onReorder: (slide: HeroSlide, direction: 'up' | 'down') => void;
  onDelete: (id: number) => void;
  isReordering?: boolean;
  className?: string;
}

export function SlideCard({
  slide,
  index,
  totalSlides,
  onEdit,
  onToggleActive,
  onReorder,
  onDelete,
  isReordering = false,
  className
}: SlideCardProps) {
  const image = slide.imagesJson && slide.imagesJson[0];

  return (
    <Card className={cn(!slide.isActive && 'opacity-60', className)}>
      <CardContent className="p-4 space-y-3">
        {/* Image Preview */}
        <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.alt || 'Slide image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                <>
                  <Columns2 className="mr-1 h-3 w-3" />
                  Split
                </>
              ) : (
                <>
                  <Maximize2 className="mr-1 h-3 w-3" />
                  Full
                </>
              )}
            </Badge>
            <Badge variant="outline">Order: {slide.order}</Badge>
            <Badge variant={slide.isActive ? 'default' : 'secondary'}>
              {slide.isActive ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Badge>
          </div>

          {slide.title && (
            <p className="text-sm font-medium line-clamp-1">{slide.title}</p>
          )}
          {slide.subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {slide.subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(slide)}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleActive(slide)}
          >
            {slide.isActive ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReorder(slide, 'up')}
            disabled={index === 0 || isReordering}
          >
            {isReordering ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReorder(slide, 'down')}
            disabled={index === totalSlides - 1 || isReordering}
          >
            {isReordering ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(slide.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}