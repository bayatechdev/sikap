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
  Users,
  ExternalLink,
  AlertCircle,
  // GripVertical
} from 'lucide-react';

export interface Partner {
  id: number;
  name: string;
  logoUrl: string;
  website?: string | null;
  description?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PartnerManagerProps {
  partners: Partner[];
  onPartnersChange: (partners: Partner[]) => void;
  className?: string;
}

interface EditingPartner extends Omit<Partner, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
}

export function PartnerManager({
  partners,
  onPartnersChange,
  className
}: PartnerManagerProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [editingPartner, setEditingPartner] = useState<EditingPartner | null>(null);

  // Add new partner - langsung create tanpa form
  const handlePartnerUpload = useCallback(async (imageData: {
    url: string;
    filename: string;
    originalName: string;
    alt: string;
    title?: string;
  }) => {
    try {
      // Auto-generate partner name from filename
      const partnerName = imageData.originalName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');

      const newPartner = {
        name: partnerName || 'New Partner',
        logoUrl: imageData.url,
        website: '',
        description: '',
        order: partners.length,
        isActive: true
      };

      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPartner),
      });

      if (!response.ok) {
        throw new Error('Failed to create partner');
      }

      const result = await response.json();
      onPartnersChange([...partners, result.partner]);
      setShowUpload(false);

      // Show success message or toast here if needed
      console.log('Partner created successfully:', result.partner.name);

    } catch (error) {
      console.error('Error creating partner:', error);
      // Show error message or toast here
    }
  }, [partners, onPartnersChange]);

  // Create partner
  const handleCreatePartner = async (partnerData: EditingPartner) => {
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnerData),
      });

      if (!response.ok) {
        throw new Error('Failed to create partner');
      }

      const result = await response.json();

      if (result.success) {
        // Refresh partners list
        const partnersResponse = await fetch('/api/partners');
        const partnersData = await partnersResponse.json();
        if (partnersData.success) {
          onPartnersChange(partnersData.partners);
        }
      }

      setEditingPartner(null);
    } catch (error) {
      console.error('Error creating partner:', error);
    }
  };

  // Delete partner
  const handleDeletePartner = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/partners/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete partner');
      }

      // Remove from local state
      const newPartners = partners.filter(p => p.id !== id);
      onPartnersChange(newPartners);
    } catch (error) {
      console.error('Error deleting partner:', error);
    }
  }, [partners, onPartnersChange]);

  // Edit partner
  const handleEditPartner = useCallback(async (updatedPartner: EditingPartner) => {
    try {
      const response = await fetch(`/api/partners/${updatedPartner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPartner),
      });

      if (!response.ok) {
        throw new Error('Failed to update partner');
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        const newPartners = partners.map(p =>
          p.id === updatedPartner.id ? result.partner : p
        );
        onPartnersChange(newPartners);
      }

      setEditingPartner(null);
    } catch (error) {
      console.error('Error updating partner:', error);
    }
  }, [partners, onPartnersChange]);

  // Toggle partner active status
  const handleToggleActive = useCallback(async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/partners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update partner status');
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        const newPartners = partners.map(p =>
          p.id === id ? { ...p, isActive } : p
        );
        onPartnersChange(newPartners);
      }
    } catch (error) {
      console.error('Error updating partner status:', error);
    }
  }, [partners, onPartnersChange]);

  // Move partner up
  const movePartnerUp = useCallback((index: number) => {
    if (index === 0) return;

    const newPartners = [...partners];
    [newPartners[index - 1], newPartners[index]] = [newPartners[index], newPartners[index - 1]];

    // Update orders
    newPartners.forEach((partner, idx) => {
      partner.order = idx;
    });

    onPartnersChange(newPartners);
  }, [partners, onPartnersChange]);

  // Move partner down
  const movePartnerDown = useCallback((index: number) => {
    if (index === partners.length - 1) return;

    const newPartners = [...partners];
    [newPartners[index], newPartners[index + 1]] = [newPartners[index + 1], newPartners[index]];

    // Update orders
    newPartners.forEach((partner, idx) => {
      partner.order = idx;
    });

    onPartnersChange(newPartners);
  }, [partners, onPartnersChange]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Partners</h3>
          <p className="text-sm text-gray-600">
            Manage your organization partners. Partners will be displayed in the order shown below.
          </p>
        </div>
        <Badge variant="secondary">
          {partners.length} partner{partners.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Partners Grid */}
      <div className="space-y-4">
        {partners.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center mb-4">
                No partners yet. Add your first partner to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          partners.map((partner, index) => (
            <Card key={partner.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Partner Logo */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      fill
                      className="object-contain p-2"
                      sizes="64px"
                    />
                  </div>

                  {/* Partner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">
                            {partner.name}
                          </h4>
                          {partner.website && (
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        {partner.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {partner.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <Switch
                            checked={partner.isActive}
                            onCheckedChange={(checked) => handleToggleActive(partner.id, checked)}
                            className="scale-75"
                          />
                          <span className="text-xs text-gray-500">
                            {partner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {/* Move buttons */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => movePartnerUp(index)}
                        disabled={index === 0}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => movePartnerDown(index)}
                        disabled={index === partners.length - 1}
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
                            <DialogTitle>{partner.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                              <Image
                                src={partner.logoUrl}
                                alt={partner.name}
                                width={200}
                                height={100}
                                className="object-contain"
                              />
                            </div>
                            <div className="space-y-2">
                              <p><span className="font-medium">Name:</span> {partner.name}</p>
                              {partner.website && (
                                <p>
                                  <span className="font-medium">Website:</span>{' '}
                                  <a
                                    href={partner.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {partner.website}
                                  </a>
                                </p>
                              )}
                              {partner.description && (
                                <p><span className="font-medium">Description:</span> {partner.description}</p>
                              )}
                              <p><span className="font-medium">Status:</span> {partner.isActive ? 'Active' : 'Inactive'}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Edit */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-1 h-8 w-8"
                        onClick={() => setEditingPartner(partner)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>

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
                            <AlertDialogTitle>Delete Partner</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{partner.name}&quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePartner(partner.id)}
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

      {/* Add New Partner */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          {showUpload ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add New Partner</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </Button>
              </div>
              <ImageUpload
                onUploadSuccess={handlePartnerUpload}
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
                Add New Partner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner Form Dialog */}
      {editingPartner && (
        <Dialog open={!!editingPartner} onOpenChange={() => setEditingPartner(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPartner.id ? 'Edit Partner' : 'Add Partner Details'}
              </DialogTitle>
            </DialogHeader>
            <PartnerForm
              partner={editingPartner}
              onSave={editingPartner.id ? handleEditPartner : handleCreatePartner}
              onCancel={() => setEditingPartner(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tips:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Upload high-quality logos (recommended: PNG/SVG with transparent background)</li>
            <li>Partners will be displayed in the order shown above</li>
            <li>Use the toggle to activate/deactivate partners without deleting them</li>
            <li>Website links will open in a new tab when clicked</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Partner Form Component
function PartnerForm({
  partner,
  onSave,
  onCancel
}: {
  partner: EditingPartner;
  onSave: (partner: EditingPartner) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: partner.name || '',
    website: partner.website || '',
    description: partner.description || '',
    isActive: partner.isActive ?? true
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      return;
    }

    onSave({
      ...partner,
      name: formData.name,
      website: formData.website || null,
      description: formData.description || null,
      isActive: formData.isActive
    });
  };

  return (
    <div className="space-y-4">
      {/* Logo Preview */}
      <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <Image
          src={partner.logoUrl}
          alt={partner.name || 'Partner logo'}
          width={120}
          height={60}
          className="object-contain"
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="partner-name">Partner Name *</Label>
          <Input
            id="partner-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter partner name"
          />
        </div>

        <div>
          <Label htmlFor="partner-website">Website URL</Label>
          <Input
            id="partner-website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <Label htmlFor="partner-description">Description</Label>
          <Textarea
            id="partner-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description about the partner"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="partner-active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="partner-active">Active</Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!formData.name.trim()}
        >
          {partner.id ? 'Save Changes' : 'Add Partner'}
        </Button>
      </div>
    </div>
  );
}