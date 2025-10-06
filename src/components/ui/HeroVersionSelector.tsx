'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Layout, Monitor } from 'lucide-react';

interface HeroVersionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function HeroVersionSelector({
  value,
  onChange,
  className
}: HeroVersionSelectorProps) {
  const versions = [
    {
      id: 'split',
      label: 'Split Layout',
      description: 'Teks di kiri, slider gambar di kanan dengan badge overlay',
      icon: Layout,
      preview: (
        <div className="relative w-full h-24 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg overflow-hidden border">
          <div className="flex h-full">
            <div className="w-1/2 p-3 space-y-2">
              <div className="h-2 bg-slate-300 rounded w-3/4"></div>
              <div className="h-1.5 bg-slate-200 rounded w-full"></div>
              <div className="h-1.5 bg-slate-200 rounded w-2/3"></div>
              <div className="flex gap-1 mt-2">
                <div className="h-4 w-12 bg-primary rounded-full"></div>
                <div className="h-4 w-12 bg-slate-300 rounded-full"></div>
              </div>
            </div>
            <div className="w-1/2 relative">
              <div className="absolute inset-2 bg-gradient-to-br from-blue-200 to-purple-200 rounded"></div>
              <div className="absolute bottom-3 left-3 h-6 w-16 bg-white/80 rounded shadow-sm"></div>
              <div className="absolute top-3 right-3 h-6 w-8 bg-white/80 rounded shadow-sm"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'fullslider',
      label: 'Full Slider',
      description: 'Full-width image slider dengan teks overlay di tengah',
      icon: Monitor,
      preview: (
        <div className="relative w-full h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg overflow-hidden border">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative flex flex-col items-center justify-center h-full text-center space-y-2 px-4">
            <div className="h-3 bg-white rounded w-1/2"></div>
            <div className="h-2 bg-white/80 rounded w-3/4"></div>
            <div className="flex gap-2 mt-2">
              <div className="h-4 w-12 bg-primary rounded-full"></div>
              <div className="h-4 w-12 bg-white/80 rounded-full"></div>
            </div>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-6 h-1 bg-primary rounded-full"></div>
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold">Hero Section Layout</h3>
        <p className="text-sm text-muted-foreground">
          Pilih versi tampilan hero section untuk homepage Anda
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {versions.map((version) => {
            const Icon = version.icon;
            const isSelected = value === version.id;

            return (
              <Card
                key={version.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  isSelected && 'ring-2 ring-primary shadow-md'
                )}
                onClick={() => onChange(version.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value={version.id}
                      id={version.id}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <Label
                          htmlFor={version.id}
                          className="font-semibold cursor-pointer"
                        >
                          {version.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {version.description}
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-3">
                    {version.preview}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
