'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Search, MoreHorizontal, Edit, Eye, ToggleLeft, ToggleRight } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface CooperationType {
  id: number;
  code: string;
  name: string;
  description: string;
  displayTitle: string;
  longDescription: string;
  features: string[];
  examples: string[];
  downloadInfo: {
    fileName: string;
    fileSize: string;
    fileType: string;
    docType: string;
    color: string;
    icon: string;
  };
  color: string;
  icon: string;
  displayOrder: number;
  showOnHomepage: boolean;
  requiredDocuments: Array<{
    name: string;
    required: boolean;
    formats: string;
    maxSize: number;
  }>;
  workflowSteps: Array<{
    step: number;
    name: string;
    description: string;
  }>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function JenisKerjasamaPage() {
  const [cooperationTypes, setCooperationTypes] = useState<CooperationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCooperationTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cooperation-types');
      if (!response.ok) {
        throw new Error('Failed to fetch cooperation types');
      }
      const data = await response.json();
      setCooperationTypes(data.cooperationTypes);
    } catch (error) {
      console.error('Error fetching cooperation types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCooperationTypes();
  }, []);

  const filteredTypes = cooperationTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (active: boolean) => {
    return active ? 'default' : 'secondary';
  };

  const getHomepageColor = (showOnHomepage: boolean) => {
    return showOnHomepage ? 'default' : 'outline';
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jenis Kerjasama</h1>
            <p className="text-muted-foreground">Kelola jenis-jenis kerjasama yang tersedia</p>
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

  return (
    <div className="@container/main space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jenis Kerjasama</h1>
          <p className="text-muted-foreground">
            Kelola jenis-jenis kerjasama yang tersedia di sistem
          </p>
        </div>
        <Link href="/dashboard/jenis-kerjasama/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Jenis Kerjasama
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Jenis Kerjasama
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cooperationTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Jenis kerjasama terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif
            </CardTitle>
            <ToggleRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cooperationTypes.filter(t => t.active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Saat ini aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Non-Aktif
            </CardTitle>
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cooperationTypes.filter(t => !t.active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sementara dinonaktifkan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tampil di Homepage
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cooperationTypes.filter(t => t.showOnHomepage).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ditampilkan di beranda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jenis Kerjasama</CardTitle>
          <CardDescription>
            Cari dan kelola semua jenis kerjasama
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Cari berdasarkan nama, kode, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Cooperation Types Table */}
          <div className="space-y-4">
            {filteredTypes.length > 0 ? filteredTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium leading-none">
                      {type.displayTitle || type.name}
                    </p>
                    <Badge variant="outline">
                      {type.code.toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusColor(type.active)}>
                      {type.active ? 'Aktif' : 'Non-Aktif'}
                    </Badge>
                    {type.showOnHomepage && (
                      <Badge variant={getHomepageColor(type.showOnHomepage)}>
                        Homepage
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {type.description || type.longDescription}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Order: {type.displayOrder}</span>
                    <span>{type.requiredDocuments.length} dokumen wajib</span>
                    <span>{type.workflowSteps.length} langkah workflow</span>
                    <span>Dibuat: {formatDate(type.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/dashboard/jenis-kerjasama/${type.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm ? 'Tidak ada jenis kerjasama yang cocok dengan pencarian.' : 'Belum ada jenis kerjasama.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}