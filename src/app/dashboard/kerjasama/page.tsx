'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, RefreshCw, FileText, Plus, Edit, Trash2, Calendar, Building } from "lucide-react";

interface Cooperation {
  id: string;
  title: string;
  cooperationType: string;
  cooperationTypeColor: string;
  orgUnit: string;
  partnerInstitution: string;
  cooperationDate: string;
  startDate?: string;
  endDate?: string;
  location: string;
  description?: string;
  objectives?: string;
  scope?: string;
  status: string;
  notes?: string;
  application?: {
    id: string;
    title: string;
    trackingNumber: string;
  };
}

interface ApprovedApplication {
  id: string;
  title: string;
  description: string;
  institutionName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  trackingNumber: string;
  approvedAt: string;
  cooperationType: {
    name: string;
  };
  cooperationCategory?: {
    name: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CooperationManagementPage() {
  const [cooperations, setCooperations] = useState<Cooperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Form states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [selectedCooperation, setSelectedCooperation] = useState<Cooperation | null>(null);
  const [formData, setFormData] = useState({
    applicationId: '',
    title: '',
    cooperationType: 'MOU' as 'MOU' | 'PKS' | 'NK',
    cooperationTypeColor: 'primary' as 'primary' | 'blue' | 'green',
    orgUnit: '',
    partnerInstitution: '',
    cooperationDate: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    objectives: '',
    scope: '',
    status: 'ACTIVE' as 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'DRAFT',
    notes: ''
  });

  // Browse applications states
  const [approvedApplications, setApprovedApplications] = useState<ApprovedApplication[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchCooperations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('cooperationType', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (locationFilter) params.append('location', locationFilter);

      const response = await fetch(`/api/cooperations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cooperations');
      }

      const data = await response.json();
      setCooperations(data.cooperations);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, typeFilter, statusFilter, locationFilter]);

  const fetchApprovedApplications = useCallback(async () => {
    try {
      setBrowseLoading(true);
      const params = new URLSearchParams();
      if (browseSearch) params.append('search', browseSearch);

      const response = await fetch(`/api/applications/approved?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch approved applications');
      }

      const data = await response.json();
      setApprovedApplications(data.applications);
    } catch (err) {
      console.error('Error fetching approved applications:', err);
    } finally {
      setBrowseLoading(false);
    }
  }, [browseSearch]);

  useEffect(() => {
    fetchCooperations();
  }, [fetchCooperations]);

  useEffect(() => {
    if (isBrowseModalOpen) {
      fetchApprovedApplications();
    }
  }, [isBrowseModalOpen, browseSearch, fetchApprovedApplications]);

  const resetForm = () => {
    setFormData({
      applicationId: '',
      title: '',
      cooperationType: 'MOU',
      cooperationTypeColor: 'primary',
      orgUnit: '',
      partnerInstitution: '',
      cooperationDate: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      objectives: '',
      scope: '',
      status: 'ACTIVE',
      notes: ''
    });
  };

  const handleCreateCooperation = async () => {
    try {
      const response = await fetch('/api/cooperations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create cooperation');
      }

      setIsCreateModalOpen(false);
      resetForm();
      fetchCooperations();
    } catch (err) {
      console.error('Error creating cooperation:', err);
    }
  };

  const handleEditCooperation = async () => {
    if (!selectedCooperation) return;

    try {
      const response = await fetch(`/api/cooperations/${selectedCooperation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update cooperation');
      }

      setIsEditModalOpen(false);
      setSelectedCooperation(null);
      resetForm();
      fetchCooperations();
    } catch (err) {
      console.error('Error updating cooperation:', err);
    }
  };

  const handleDeleteCooperation = async () => {
    if (!selectedCooperation) return;

    try {
      const response = await fetch(`/api/cooperations/${selectedCooperation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cooperation');
      }

      setIsDeleteModalOpen(false);
      setSelectedCooperation(null);
      fetchCooperations();
    } catch (err) {
      console.error('Error deleting cooperation:', err);
    }
  };

  const handleImportFromApplication = (application: ApprovedApplication) => {
    setFormData({
      ...formData,
      applicationId: application.id,
      title: application.title,
      partnerInstitution: application.institutionName,
      description: application.description,
      cooperationType: application.cooperationType.name === 'MOU' ? 'MOU' :
                      application.cooperationType.name === 'PKS' ? 'PKS' : 'NK',
      cooperationTypeColor: application.cooperationType.name === 'MOU' ? 'primary' :
                           application.cooperationType.name === 'PKS' ? 'blue' : 'green',
    });
    setIsBrowseModalOpen(false);
  };

  const openEditModal = (cooperation: Cooperation) => {
    setSelectedCooperation(cooperation);
    setFormData({
      applicationId: cooperation.application?.id || '',
      title: cooperation.title,
      cooperationType: cooperation.cooperationType as 'MOU' | 'PKS' | 'NK',
      cooperationTypeColor: cooperation.cooperationTypeColor as 'primary' | 'blue' | 'green',
      orgUnit: cooperation.orgUnit,
      partnerInstitution: cooperation.partnerInstitution,
      cooperationDate: cooperation.cooperationDate ? new Date(cooperation.cooperationDate).toISOString().split('T')[0] : '',
      startDate: cooperation.startDate ? new Date(cooperation.startDate).toISOString().split('T')[0] : '',
      endDate: cooperation.endDate ? new Date(cooperation.endDate).toISOString().split('T')[0] : '',
      location: cooperation.location,
      description: cooperation.description || '',
      objectives: cooperation.objectives || '',
      scope: cooperation.scope || '',
      status: cooperation.status as 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'DRAFT',
      notes: cooperation.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'DRAFT': return 'secondary';
      case 'EXPIRED': return 'destructive';
      case 'TERMINATED': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string, color: string) => {
    switch (color) {
      case 'primary': return 'default';
      case 'blue': return 'secondary';
      case 'green': return 'outline';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="@container/main space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cooperation Management</h1>
          <p className="text-muted-foreground">
            Manage cooperation agreements and partnerships
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Cooperation
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cooperations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="MOU">MOU</SelectItem>
                  <SelectItem value="PKS">PKS</SelectItem>
                  <SelectItem value="NK">Nota Kesepakatan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button
                onClick={fetchCooperations}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cooperations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cooperations</CardTitle>
          <CardDescription>
            {pagination.total} total cooperations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading cooperations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error: {error}</p>
              <Button onClick={fetchCooperations} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : cooperations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No cooperations found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>OPD</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cooperations.map((cooperation) => (
                    <TableRow key={cooperation.id}>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium truncate">{cooperation.title}</div>
                          {cooperation.application && (
                            <div className="text-sm text-muted-foreground">
                              From: {cooperation.application.trackingNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(cooperation.cooperationType, cooperation.cooperationTypeColor)}>
                          {cooperation.cooperationType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">
                          {cooperation.partnerInstitution}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate">
                          {cooperation.orgUnit}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatDate(cooperation.cooperationDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate">
                          {cooperation.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(cooperation.status)}>
                          {cooperation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(cooperation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCooperation(cooperation);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} cooperations
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Cooperation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Cooperation</DialogTitle>
            <DialogDescription>
              Add a new cooperation agreement. You can import data from approved applications or enter manually.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Import from Application Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBrowseModalOpen(true)}
              >
                <Building className="h-4 w-4 mr-2" />
                Browse Applications
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter cooperation title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooperationType">Type *</Label>
                <Select
                  value={formData.cooperationType}
                  onValueChange={(value) => setFormData({ ...formData, cooperationType: value as 'MOU' | 'PKS' | 'NK' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOU">MOU</SelectItem>
                    <SelectItem value="PKS">PKS</SelectItem>
                    <SelectItem value="NK">Nota Kesepakatan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooperationTypeColor">Type Color</Label>
                <Select
                  value={formData.cooperationTypeColor}
                  onValueChange={(value) => setFormData({ ...formData, cooperationTypeColor: value as 'primary' | 'blue' | 'green' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgUnit">OPD *</Label>
                <Input
                  id="orgUnit"
                  value={formData.orgUnit}
                  onChange={(e) => setFormData({ ...formData, orgUnit: e.target.value })}
                  placeholder="Enter organizational unit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnerInstitution">Partner Institution *</Label>
                <Input
                  id="partnerInstitution"
                  value={formData.partnerInstitution}
                  onChange={(e) => setFormData({ ...formData, partnerInstitution: e.target.value })}
                  placeholder="Enter partner institution"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooperationDate">Cooperation Date *</Label>
                <Input
                  id="cooperationDate"
                  type="date"
                  value={formData.cooperationDate}
                  onChange={(e) => setFormData({ ...formData, cooperationDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'DRAFT' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter cooperation description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Objectives</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="Enter cooperation objectives"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Textarea
                id="scope"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                placeholder="Enter cooperation scope"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter additional notes"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateCooperation}>
              Create Cooperation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cooperation Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cooperation</DialogTitle>
            <DialogDescription>
              Update cooperation agreement details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter cooperation title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cooperationType">Type *</Label>
                <Select
                  value={formData.cooperationType}
                  onValueChange={(value) => setFormData({ ...formData, cooperationType: value as 'MOU' | 'PKS' | 'NK' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOU">MOU</SelectItem>
                    <SelectItem value="PKS">PKS</SelectItem>
                    <SelectItem value="NK">Nota Kesepakatan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cooperationTypeColor">Type Color</Label>
                <Select
                  value={formData.cooperationTypeColor}
                  onValueChange={(value) => setFormData({ ...formData, cooperationTypeColor: value as 'primary' | 'blue' | 'green' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-orgUnit">OPD *</Label>
                <Input
                  id="edit-orgUnit"
                  value={formData.orgUnit}
                  onChange={(e) => setFormData({ ...formData, orgUnit: e.target.value })}
                  placeholder="Enter organizational unit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-partnerInstitution">Partner Institution *</Label>
                <Input
                  id="edit-partnerInstitution"
                  value={formData.partnerInstitution}
                  onChange={(e) => setFormData({ ...formData, partnerInstitution: e.target.value })}
                  placeholder="Enter partner institution"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cooperationDate">Cooperation Date *</Label>
                <Input
                  id="edit-cooperationDate"
                  type="date"
                  value={formData.cooperationDate}
                  onChange={(e) => setFormData({ ...formData, cooperationDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'DRAFT' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter cooperation description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-objectives">Objectives</Label>
              <Textarea
                id="edit-objectives"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="Enter cooperation objectives"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-scope">Scope</Label>
              <Textarea
                id="edit-scope"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                placeholder="Enter cooperation scope"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter additional notes"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditCooperation}>
              Update Cooperation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cooperation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCooperation?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteCooperation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Browse Applications Modal */}
      <Dialog open={isBrowseModalOpen} onOpenChange={setIsBrowseModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Browse Approved Applications</DialogTitle>
            <DialogDescription>
              Select an approved application to import its data for cooperation creation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {browseLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading applications...</p>
                </div>
              ) : approvedApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No approved applications found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {approvedApplications.map((application) => (
                    <Card key={application.id} className="cursor-pointer hover:bg-accent" onClick={() => handleImportFromApplication(application)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{application.title}</h4>
                            <p className="text-sm text-muted-foreground">{application.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>#{application.trackingNumber}</span>
                              <span>{application.institutionName}</span>
                              <span>{application.cooperationType.name}</span>
                            </div>
                          </div>
                          <Badge variant="default">Approved</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsBrowseModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}