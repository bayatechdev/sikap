'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Minus, Upload, ArrowLeft } from 'lucide-react';
import { CenterLoadingSkeleton } from '@/components/ui/skeleton-variants';
import { useToast } from '@/hooks/use-toast';

const updateSOPSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  color: z.string().min(1, 'Color is required'),
  displayOrder: z.number().min(0, 'Display order must be 0 or greater'),
  active: z.boolean(),
  features: z.array(z.string().min(1, 'Feature cannot be empty')),
  downloadInfo: z.object({
    fileName: z.string(),
    fileSize: z.string(),
    fileType: z.string(),
    lastUpdated: z.string(),
  }),
});

type FormData = z.infer<typeof updateSOPSchema>;

interface SOPDocument {
  id: number;
  title: string;
  category: string;
  description: string;
  imagePath: string | null;
  features: string[];
  downloadInfo: Record<string, unknown> | null;
  color: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditSOPPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(updateSOPSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: control as never,
    name: 'features',
  });

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/sop-documents/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch SOP document');
        }

        const document: SOPDocument = await response.json();

        // Parse JSON fields from API response
        const parsedFeatures = document.features && typeof document.features === 'string'
          ? JSON.parse(document.features)
          : (document.features || ['']);
        const parsedDownloadInfo = document.downloadInfo && typeof document.downloadInfo === 'string'
          ? JSON.parse(document.downloadInfo)
          : document.downloadInfo;

        reset({
          title: document.title,
          category: document.category,
          description: document.description,
          color: document.color,
          displayOrder: document.displayOrder,
          active: document.active,
          features: parsedFeatures.length > 0 ? parsedFeatures : [''],
          downloadInfo: {
            fileName: parsedDownloadInfo?.fileName || '',
            fileSize: parsedDownloadInfo?.fileSize || '',
            fileType: parsedDownloadInfo?.fileType || 'PDF',
            lastUpdated: parsedDownloadInfo?.lastUpdated || new Date().toLocaleDateString('id-ID'),
          },
        });
      } catch (error) {
        console.error('Error fetching document:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch SOP document',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchDocument();
    }
  }, [params.id, reset, toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'sop-document');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      await response.json();

      setUploadedFile(file);
      setValue('downloadInfo.fileName', file.name);
      setValue('downloadInfo.fileSize', `${(file.size / 1024 / 1024).toFixed(1)} MB`);
      setValue('downloadInfo.fileType', file.type.includes('pdf') ? 'PDF' : 'DOC');
      setValue('downloadInfo.lastUpdated', new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }));

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/sop-documents/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update SOP document');
      }

      toast({
        title: 'Success',
        description: 'SOP document updated successfully',
      });

      router.push('/dashboard/sop');
    } catch (error) {
      console.error('Error updating SOP document:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update SOP document',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <CenterLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit SOP</h1>
          <p className="text-muted-foreground">
            Update the Standard Operating Procedure document
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the basic details for the SOP document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter SOP title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Enter category"
                />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter detailed description"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color Theme</Label>
                <Select
                  value={watch('color')}
                  onValueChange={(value) => setValue('color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  {...register('displayOrder', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.displayOrder && (
                  <p className="text-sm text-destructive">{errors.displayOrder.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={watch('active')}
                  onCheckedChange={(checked) => setValue('active', checked)}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              Update the key features or highlights of this SOP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`features.${index}` as const)}
                  placeholder={`Feature ${index + 1}`}
                  className="flex-1"
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append('')}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Document File</CardTitle>
            <CardDescription>
              Replace or update the SOP document file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload New File (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Button type="button" variant="outline" asChild>
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </label>
                </Button>
              </div>
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  New file: {uploadedFile.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  {...register('downloadInfo.fileName')}
                  placeholder="Document file name"
                />
                {errors.downloadInfo?.fileName && (
                  <p className="text-sm text-destructive">
                    {errors.downloadInfo.fileName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileSize">File Size</Label>
                <Input
                  id="fileSize"
                  {...register('downloadInfo.fileSize')}
                  placeholder="e.g., 2.5 MB"
                />
                {errors.downloadInfo?.fileSize && (
                  <p className="text-sm text-destructive">
                    {errors.downloadInfo.fileSize.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update SOP Document'}
          </Button>
        </div>
      </form>
    </div>
  );
}