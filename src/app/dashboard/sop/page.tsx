'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTableSkeleton } from '@/components/ui/skeleton-variants';

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

interface APIResponse {
  documents: SOPDocument[];
  totalCount: number;
  categories: { name: string; count: number }[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function SOPPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<SOPDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<SOPDocument | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      // For admin dashboard, we still want to see all documents, but let's include active ones by default
      params.append('active', 'true');

      const response = await fetch(`/api/sop-documents?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch SOP documents');
      }

      const data: APIResponse = await response.json();
      setDocuments(data.documents);
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch SOP documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      const response = await fetch(`/api/sop-documents/${documentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast({
        title: 'Success',
        description: 'SOP document deleted successfully',
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete SOP document',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownload = (doc: SOPDocument) => {
    window.open(`/api/sop-documents/${doc.id}/download`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getColorBadge = (color: string) => {
    const colorMap: Record<string, string> = {
      primary: 'bg-primary text-primary-foreground',
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      orange: 'bg-orange-500 text-white',
      red: 'bg-red-500 text-white',
    };

    return colorMap[color] || colorMap.primary;
  };

  if (loading) {
    return <DataTableSkeleton />;
  }

  return (
    <div className="@container/main space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SOP Management</h1>
          <p className="text-muted-foreground">
            Manage Standard Operating Procedures documents
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/sop/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New SOP
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SOP documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name} ({category.count})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No SOP documents found
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="max-w-[300px]">
                    <div>
                      <div className="font-medium line-clamp-2 leading-tight break-words">{doc.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1 mt-1 break-words">
                        {doc.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{doc.category}</TableCell>
                  <TableCell>
                    <Badge className={getColorBadge(doc.color)}>
                      {doc.color}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doc.active ? 'default' : 'secondary'}>
                      {doc.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(doc.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/sop/${doc.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(doc)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDocumentToDelete(doc);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the SOP document
              &quot;{documentToDelete?.title}&quot; and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}