'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface RequiredDocument {
  name: string;
  required: boolean;
  formats: string;
  maxSize: number;
}

interface WorkflowStep {
  step: number;
  name: string;
  description: string;
}

export default function CreateJenisKerjasamaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form data
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayTitle, setDisplayTitle] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [color, setColor] = useState('primary');
  const [icon, setIcon] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [active, setActive] = useState(true);

  // Arrays
  const [features, setFeatures] = useState<string[]>(['']);
  const [examples, setExamples] = useState<string[]>(['']);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([
    { name: '', required: true, formats: 'PDF, DOC, DOCX', maxSize: 10 }
  ]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { step: 1, name: '', description: '' }
  ]);

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleAddExample = () => {
    setExamples([...examples, '']);
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const handleAddDocument = () => {
    setRequiredDocuments([...requiredDocuments, { name: '', required: true, formats: 'PDF, DOC, DOCX', maxSize: 10 }]);
  };

  const handleRemoveDocument = (index: number) => {
    setRequiredDocuments(requiredDocuments.filter((_, i) => i !== index));
  };

  const handleDocumentChange = (index: number, field: keyof RequiredDocument, value: string | boolean | number) => {
    const newDocuments = [...requiredDocuments];
    newDocuments[index] = { ...newDocuments[index], [field]: value };
    setRequiredDocuments(newDocuments);
  };

  const handleAddWorkflowStep = () => {
    const nextStep = workflowSteps.length + 1;
    setWorkflowSteps([...workflowSteps, { step: nextStep, name: '', description: '' }]);
  };

  const handleRemoveWorkflowStep = (index: number) => {
    const newSteps = workflowSteps.filter((_, i) => i !== index);
    // Reorder step numbers
    const reorderedSteps = newSteps.map((step, i) => ({ ...step, step: i + 1 }));
    setWorkflowSteps(reorderedSteps);
  };

  const handleWorkflowStepChange = (index: number, field: keyof WorkflowStep, value: string | number) => {
    const newSteps = [...workflowSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setWorkflowSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const downloadInfo = {
        fileName: `Template_${code.toUpperCase()}`,
        fileSize: '150KB',
        fileType: 'PDF',
        docType: name,
        color: color,
        icon: icon || '📄'
      };

      const data = {
        code,
        name,
        description,
        displayTitle,
        longDescription,
        features: features.filter(f => f.trim() !== ''),
        examples: examples.filter(e => e.trim() !== ''),
        downloadInfo,
        color,
        icon: icon || '📄',
        displayOrder,
        showOnHomepage,
        requiredDocuments: requiredDocuments.filter(d => d.name.trim() !== ''),
        workflowSteps: workflowSteps.filter(s => s.name.trim() !== ''),
        active
      };

      const response = await fetch('/api/cooperation-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create cooperation type');
      }

      router.push('/dashboard/jenis-kerjasama');
    } catch (error) {
      console.error('Error creating cooperation type:', error);
      alert('Gagal membuat jenis kerjasama. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="@container/main space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/jenis-kerjasama">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tambah Jenis Kerjasama</h1>
            <p className="text-muted-foreground">
              Buat jenis kerjasama baru dengan mengisi form berikut
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
            <CardDescription>Informasi dasar jenis kerjasama</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kode *</Label>
                <Input
                  id="code"
                  placeholder="mou, pks, dll"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  placeholder="Memorandum of Understanding"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                placeholder="Deskripsi singkat"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayTitle">Judul Tampilan</Label>
              <Input
                id="displayTitle"
                placeholder="Judul yang akan ditampilkan di homepage"
                value={displayTitle}
                onChange={(e) => setDisplayTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Deskripsi Panjang</Label>
              <Textarea
                id="longDescription"
                placeholder="Deskripsi lengkap untuk homepage"
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Tampilan</CardTitle>
            <CardDescription>Pengaturan untuk tampilan di homepage dan dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Warna</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih warna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  placeholder="📄, 📋, 🤝"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Urutan Tampilan</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showOnHomepage"
                  checked={showOnHomepage}
                  onCheckedChange={setShowOnHomepage}
                />
                <Label htmlFor="showOnHomepage">Tampilkan di Homepage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active">Aktif</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Fitur</CardTitle>
            <CardDescription>Fitur-fitur yang akan ditampilkan di homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Fitur ${index + 1}`}
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                />
                {features.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddFeature}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Fitur
            </Button>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Contoh</CardTitle>
            <CardDescription>Contoh-contoh yang akan ditampilkan di homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {examples.map((example, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Contoh ${index + 1}`}
                  value={example}
                  onChange={(e) => handleExampleChange(index, e.target.value)}
                />
                {examples.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveExample(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddExample}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Contoh
            </Button>
          </CardContent>
        </Card>

        {/* Required Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Dokumen Yang Diperlukan</CardTitle>
            <CardDescription>Dokumen yang harus diunggah untuk jenis kerjasama ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredDocuments.map((doc, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Dokumen {index + 1}</h4>
                  {requiredDocuments.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Nama Dokumen</Label>
                    <Input
                      placeholder="Proposal Kerjasama"
                      value={doc.name}
                      onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Format File</Label>
                    <Input
                      placeholder="PDF, DOC, DOCX"
                      value={doc.formats}
                      onChange={(e) => handleDocumentChange(index, 'formats', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Ukuran Maksimal (MB)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={doc.maxSize}
                      onChange={(e) => handleDocumentChange(index, 'maxSize', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={doc.required}
                      onCheckedChange={(checked) => handleDocumentChange(index, 'required', checked)}
                    />
                    <Label>Wajib</Label>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddDocument}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Dokumen
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Langkah Workflow</CardTitle>
            <CardDescription>Langkah-langkah proses persetujuan untuk jenis kerjasama ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Langkah {step.step}</h4>
                  {workflowSteps.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveWorkflowStep(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Nama Langkah</Label>
                    <Input
                      placeholder="Pengajuan Proposal"
                      value={step.name}
                      onChange={(e) => handleWorkflowStepChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Deskripsi</Label>
                    <Input
                      placeholder="Deskripsi langkah"
                      value={step.description}
                      onChange={(e) => handleWorkflowStepChange(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddWorkflowStep}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Langkah
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/jenis-kerjasama">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
}