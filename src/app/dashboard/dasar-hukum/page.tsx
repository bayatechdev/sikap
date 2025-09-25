"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Download, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(`/api/legal-documents?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data: ApiResponse = await response.json();
      setDocuments(data.documents);
      setCategories(data.categories);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) {
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
      alert(err instanceof Error ? err.message : "Failed to delete document");
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Undang-Undang":
        return "bg-red-100 text-red-800 border-red-200";
      case "Peraturan Pemerintah":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Peraturan Menteri":
        return "bg-green-100 text-green-800 border-green-200";
      case "Peraturan Daerah":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dasar Hukum</h1>
          <p className="text-gray-600 mt-1">
            Manage legal documents and regulations ({totalCount} documents)
          </p>
        </div>
        <Link href="/dashboard/dasar-hukum/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[200px]"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Legal Documents</h2>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No documents found. {searchTerm || selectedCategory ? "Try adjusting your filters." : ""}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((document) => (
              <div key={document.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {document.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium border rounded-full ${getCategoryBadgeColor(
                          document.category
                        )}`}
                      >
                        {document.category}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">{document.documentNumber}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Tahun {document.year}</span>
                      {document.description && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{document.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => window.open(`/api/legal-documents/${document.id}/download`, '_blank')}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/dashboard/dasar-hukum/${document.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(document.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category.name} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{category.count}</div>
            <div className="text-sm text-gray-600">{category.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}