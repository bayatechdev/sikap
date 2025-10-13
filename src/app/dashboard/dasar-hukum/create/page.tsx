"use client";

import React, { useState } from "react";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormData {
  title: string;
  documentNumber: string;
  year: string;
  category: string;
  description: string;
  file: File | null;
}

const categories = [
  "Undang-Undang",
  "Peraturan Pemerintah",
  "Peraturan Menteri",
  "Peraturan Daerah"
];

export default function CreateLegalDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    documentNumber: "",
    year: new Date().getFullYear().toString(),
    category: "",
    description: "",
    file: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      file
    }));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'legal-document');

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }

    const data = await response.json();
    return data.relativePath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload file first
      const relativePath = await uploadFile(formData.file);

      // Create legal document record
      const response = await fetch('/api/legal-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          documentNumber: formData.documentNumber,
          year: formData.year,
          category: formData.category,
          description: formData.description,
          relativePath: relativePath,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create legal document');
      }

      // Redirect to list page
      router.push('/dashboard/dasar-hukum');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="@container/main space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/dasar-hukum">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tambah Dasar Hukum</h1>
            <p className="text-muted-foreground">
              Tambah dokumen hukum atau peraturan baru
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dokumen</CardTitle>
            <CardDescription>
              Masukkan informasi dasar dokumen hukum
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: UU No. 6 Tahun 2014 tentang Desa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Nomor Dokumen *</Label>
                <Input
                  id="documentNumber"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: UU-06-2014"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Tahun *</Label>
                <Input
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{4}"
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Deskripsi singkat dokumen hukum..."
              />
            </div>
          </CardContent>
        </Card>

              {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Unggah Dokumen</CardTitle>
            <CardDescription>
              Unggah file PDF untuk dokumen hukum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">File PDF *</Label>
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-muted-foreground/25 rounded-md hover:border-muted-foreground/50 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <label
                        htmlFor="file"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                      >
                        <span>Unggah file</span>
                        <input
                          id="file"
                          name="file"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          required
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">File PDF saja, maksimal 10MB</p>
                  </div>
                </div>
              </div>

              {formData.file && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm text-primary">{formData.file.name}</span>
                  <span className="text-xs text-primary ml-auto">
                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/dasar-hukum">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Dokumen"}
          </Button>
        </div>
      </form>
    </div>
  );
}