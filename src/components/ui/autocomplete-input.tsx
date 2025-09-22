'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useInstitutionsSearch } from '@/hooks/use-institutions';
import { cn } from '@/lib/utils';

interface Institution {
  id: number;
  name: string;
  type: string;
  code: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onInstitutionSelect?: (institution: Institution | null) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  onInstitutionSelect,
  placeholder = 'Masukkan nama institusi',
  className,
  error,
  required = false,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const { data, isLoading } = useInstitutionsSearch(searchQuery);
  const institutions = data?.institutions || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);

    // Clear selected institution when user types
    if (onInstitutionSelect) {
      onInstitutionSelect(null);
    }
  };

  const handleInstitutionSelect = (institution: Institution) => {
    onChange(institution.name);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onInstitutionSelect) {
      onInstitutionSelect(institution);
    }
  };

  const handleAddCustom = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onInstitutionSelect) {
      onInstitutionSelect(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalOptions = institutions.length + 1; // +1 for custom option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < totalOptions - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : totalOptions - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < institutions.length) {
          handleInstitutionSelect(institutions[highlightedIndex]);
        } else if (highlightedIndex === institutions.length) {
          handleAddCustom();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (value.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow clicks on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showDropdown = isOpen && value.length >= 2;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={cn(
          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
      />

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
              <span className="ml-2">Mencari...</span>
            </div>
          )}

          {!isLoading && institutions.length === 0 && (
            <div className="p-3 text-center text-gray-500">
              Tidak ada institusi ditemukan
            </div>
          )}

          {!isLoading && institutions.length > 0 && (
            <>
              {institutions.map((institution, index) => (
                <button
                  key={institution.id}
                  type="button"
                  onClick={() => handleInstitutionSelect(institution)}
                  className={cn(
                    'w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0',
                    highlightedIndex === index && 'bg-gray-50'
                  )}
                >
                  <div className="font-medium text-gray-900">
                    {institution.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {institution.type} • {institution.code}
                  </div>
                  {institution.contactPerson && (
                    <div className="text-xs text-gray-400">
                      {institution.contactPerson}
                    </div>
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={handleAddCustom}
                className={cn(
                  'w-full text-left p-3 hover:bg-gray-50 transition-colors border-t border-gray-200 text-primary',
                  highlightedIndex === institutions.length && 'bg-gray-50'
                )}
              >
                <div className="font-medium">
                  ✚ Tambah Baru: &quot;{value}&quot;
                </div>
                <div className="text-sm text-gray-500">
                  Gunakan nama institusi yang Anda masukkan
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}