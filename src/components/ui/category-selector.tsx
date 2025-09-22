'use client';

import React from 'react';
import { useCooperationCategories } from '@/hooks/use-cooperation-categories';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  className?: string;
  error?: string;
  required?: boolean;
}

export function CategorySelector({
  value,
  onChange,
  className,
  error,
  required = false,
}: CategorySelectorProps) {
  const { data, isLoading, isError } = useCooperationCategories();
  const categories = data?.categories || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue ? parseInt(selectedValue) : undefined);
  };

  if (isError) {
    return (
      <div className="text-red-500 text-sm">
        Gagal memuat kategori kerjasama
      </div>
    );
  }

  return (
    <div>
      <select
        value={value || ''}
        onChange={handleChange}
        required={required}
        disabled={isLoading}
        className={cn(
          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200',
          error ? 'border-red-500' : 'border-gray-300',
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <option value="">
          {isLoading ? 'Memuat kategori...' : 'Pilih kategori kerjasama'}
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
            {category.description && ` - ${category.description}`}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}