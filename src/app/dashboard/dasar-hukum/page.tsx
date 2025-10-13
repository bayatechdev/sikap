"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Download, FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LegalDocument {
  id: number;
  title: string;
  documentNumber: string;
  year: string;
  category: string;
  relativePath: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  name: string;
  count: number;
}

interface ApiResponse {
  documents: LegalDocument[];
  totalCount: number;
  categories: Category[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function DasarHukumPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/legal-documents');
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data: ApiResponse = await response.json();
      setDocuments(data.documents);
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Client-side filtering
  const filteredDocuments = documents.filter(document =>
    (selectedCategory === '' || document.category === selectedCategory) &&
    (searchTerm === '' ||
     document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     document.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (document.description && document.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/legal-documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      // Refresh the list
      fetchDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus dokumen");
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "Undang-Undang":
        return "destructive";
      case "Peraturan Pemerintah":
        return "default";
      case "Peraturan Menteri":
        return "secondary";
      case "Peraturan Daerah":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="@container/main space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dasar Hukum</h1>
            <p className="text-muted-foreground">Kelola dokumen hukum dan peraturan yang tersedia</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="@container/main space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dasar Hukum</h1>
            <p className="text-muted-foreground">Kelola dokumen hukum dan peraturan yang tersedia</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-destructive text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="@container/main space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dasar Hukum</h1>
          <p className="text-muted-foreground">
            Kelola dokumen hukum dan peraturan yang tersedia di sistem ({documents.length} dokumen)
          </p>
        </div>
        <Link href="/dashboard/dasar-hukum/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Dokumen
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Dasar Hukum
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              Dokumen terdaftar
            </p>
          </CardContent>
        </Card>
        {categories.slice(0, 3).map((category) => (
          <Card key={category.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {category.name}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.count}</div>
              <p className="text-xs text-muted-foreground">
                Dokumen {category.name.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Dasar Hukum</CardTitle>
          <CardDescription>
            Cari dan kelola semua dokumen hukum dan peraturan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan judul, nomor, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
            >
              Semua Kategori
            </Button>
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>

          {/* Documents List */}
          <div className="py-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm || selectedCategory ? 'Tidak ada dokumen yang cocok dengan pencarian.' : 'Belum ada dokumen hukum.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium leading-none truncate">
                          {document.title}
                        </p>
                        <Badge variant={getCategoryBadgeVariant(document.category)}>
                          {document.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {document.documentNumber} • Tahun {document.year}
                        {document.description && ` • ${document.description}`}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Kategori: {document.category}</span>
                        <span>Dibuat: {formatDate(document.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/legal-documents/${document.id}/download`, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Unduh
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/dasar-hukum/${document.id}`}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(document.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}