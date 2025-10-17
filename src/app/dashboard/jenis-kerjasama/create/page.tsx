'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trash2, Save, FileText, Settings } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormTabs } from "@/components/ui/FormTabs"
import { TagInput } from "@/components/ui/TagInput"
import { AccordionForm } from "@/components/ui/AccordionForm"

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

  const tabs = [
    {
      id: 'basic',
      label: 'Informasi Utama',
      description: 'Data dasar dan pengaturan tampilan untuk jenis kerjasama',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Dasar</h3>
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
              <Label htmlFor="description">Deskripsi Singkat</Label>
              <Input
                id="description"
                placeholder="Deskripsi singkat untuk overview"
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
          </div>

          {/* Display Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pengaturan Tampilan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Warna Tema</Label>
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

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showOnHomepage"
                  checked={showOnHomepage}
                  onCheckedChange={setShowOnHomepage}
                />
                <Label htmlFor="showOnHomepage" className="cursor-pointer">
                  Tampilkan di Homepage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Aktif
                </Label>
              </div>
            </div>
          </div>

          {/* Content Management Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Konten Homepage</h3>

            <TagInput
              value={features.filter(f => f.trim() !== '')}
              onChange={(newFeatures) => {
                // Always keep at least one empty field for editing
                const adjustedFeatures = newFeatures.length > 0 ? newFeatures : [''];
                setFeatures(adjustedFeatures);
              }}
              label="Fitur Unggulan"
              description="Fitur-fitur yang akan ditampilkan di homepage"
              placeholder="Tambah fitur..."
              maxLength={8}
            />

            <TagInput
              value={examples.filter(e => e.trim() !== '')}
              onChange={(newExamples) => {
                // Always keep at least one empty field for editing
                const adjustedExamples = newExamples.length > 0 ? newExamples : [''];
                setExamples(adjustedExamples);
              }}
              label="Contoh Implementasi"
              description="Contoh-contoh yang akan ditampilkan di homepage"
              placeholder="Tambah contoh..."
              maxLength={6}
            />
          </div>
        </div>
      )
    },
    {
      id: 'advanced',
      label: 'Pengaturan Lanjutan',
      description: 'Dokumen yang diperlukan dan workflow proses persetujuan',
      icon: <Settings className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Required Documents */}
          <AccordionForm
            title="Dokumen Persyaratan"
            description="Dokumen yang harus diunggah oleh pengguna"
            addButtonText="Tambah Dokumen"
            onAddItem={handleAddDocument}
            items={requiredDocuments.map((doc, index) => ({
              id: `doc-${index}`,
              title: doc.name || `Dokumen ${index + 1}`,
              subtitle: `${doc.formats} • Maks ${doc.maxSize}MB • ${doc.required ? 'Wajib' : 'Opsional'}`,
              content: (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Dokumen</Label>
                      <Input
                        placeholder="Contoh: Proposal Kerjasama"
                        value={doc.name}
                        onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Format File</Label>
                      <Input
                        placeholder="PDF, DOC, DOCX"
                        value={doc.formats}
                        onChange={(e) => handleDocumentChange(index, 'formats', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
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
                      <Label className="cursor-pointer">Dokumen Wajib</Label>
                    </div>
                  </div>
                  {requiredDocuments.length > 1 && (
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveDocument(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus Dokumen
                      </Button>
                    </div>
                  )}
                </div>
              )
            }))}
          />

          {/* Workflow Steps */}
          <AccordionForm
            title="Langkah Workflow"
            description="Proses alur persetujuan untuk jenis kerjasama ini"
            addButtonText="Tambah Langkah"
            onAddItem={handleAddWorkflowStep}
            items={workflowSteps.map((step, index) => ({
              id: `step-${index}`,
              title: step.name || `Langkah ${step.step}`,
              subtitle: step.description || 'Belum ada deskripsi',
              content: (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Langkah</Label>
                      <Input
                        placeholder="Contoh: Pengajuan Proposal"
                        value={step.name}
                        onChange={(e) => handleWorkflowStepChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deskripsi Langkah</Label>
                      <Input
                        placeholder="Contoh: User mengajukan proposal kerjasama"
                        value={step.description}
                        onChange={(e) => handleWorkflowStepChange(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                  {workflowSteps.length > 1 && (
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveWorkflowStep(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus Langkah
                      </Button>
                    </div>
                  )}
                </div>
              )
            }))}
          />
        </div>
      )
    }
  ];

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
              Buat jenis kerjasama baru dengan form yang terstruktur
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormTabs tabs={tabs} />

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link href="/dashboard/jenis-kerjasama">
            <Button type="button" variant="outline" size="lg">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={loading} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Jenis Kerjasama'}
          </Button>
        </div>
      </form>
    </div>
  )
}