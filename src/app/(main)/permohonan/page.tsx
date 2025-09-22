"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { CategorySelector } from "@/components/ui/category-selector";
import { SecureFileUpload } from "@/components/ui/secure-file-upload";
import { useCreateApplication } from "@/hooks/use-applications";

interface FormData {
  nama: string;
  email: string;
  contactPerson: string;
  instansi: string;
  cooperationCategoryId?: number;
  institutionId?: number;
  keperluan: string;
  tentang: string;
  catatan: string;
}

interface Institution {
  id: number;
  name: string;
  type: string;
  code: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
}

interface FormErrors {
  [key: string]: string;
}

interface SubmissionResult {
  success: boolean;
  trackingNumber: string;
  publicToken: string;
  applicationId: string;
  message: string;
}

const tabsConfig = {
  mou: {
    label: "MOU",
    title: "Memorandum of Understanding",
    description: "Pengajuan permohonan MOU untuk kerjasama antar instansi",
    files: [
      { key: "suratPermohonan", label: "Surat Permohonan", required: true },
      { key: "draftMou", label: "Draft MOU", required: true },
      { key: "studiKelayakan", label: "Studi Kelayakan Kerjasama / KAK", required: true },
      { key: "profilKota", label: "Profil Kota", required: true },
      { key: "legalStanding", label: "Legal Standing Perusahaan", required: true },
    ],
  },
  pks: {
    label: "PKS",
    title: "Perjanjian Kerjasama",
    description: "Pengajuan permohonan PKS untuk kerjasama operasional",
    files: [
      { key: "suratPermohonan", label: "Surat Permohonan", required: true },
      { key: "draftPks", label: "Draft PKS", required: true },
    ],
  },
  suratKuasa: {
    label: "Surat Kuasa",
    title: "Surat Kuasa",
    description: "Pengajuan permohonan surat kuasa untuk representasi legal",
    files: [
      { key: "suratPermohonan", label: "Surat Permohonan", required: true },
      { key: "draftPks", label: "Draft PKS", required: true },
    ],
  },
  notaKesepakatan: {
    label: "Nota Kesepakatan",
    title: "Nota Kesepakatan",
    description: "Pengajuan permohonan nota kesepakatan untuk kerjasama strategis",
    files: [
      { key: "suratPermohonan", label: "Surat Permohonan", required: true },
      { key: "draftPks", label: "Draft PKS", required: true },
    ],
  },
};

export default function PermohonanPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof tabsConfig>("mou");
  const [formData, setFormData] = useState<FormData>({
    nama: "",
    email: "",
    contactPerson: "",
    instansi: "",
    keperluan: "",
    tentang: "",
    catatan: "",
  });
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // React Query hooks
  const createApplicationMutation = useCreateApplication();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.nama.trim()) newErrors.nama = "Nama lengkap wajib diisi";
    if (!formData.email.trim()) newErrors.email = "Email wajib diisi";
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person wajib diisi";
    if (!formData.instansi.trim()) newErrors.instansi = "Instansi wajib diisi";
    if (!formData.keperluan.trim()) newErrors.keperluan = "Keperluan wajib diisi";
    if (!formData.tentang.trim()) newErrors.tentang = "Deskripsi tentang wajib diisi";

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (formData.contactPerson && !phoneRegex.test(formData.contactPerson)) {
      newErrors.contactPerson = "Format nomor telepon tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleInstitutionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      instansi: value,
    }));

    // Clear error when user types
    if (errors.instansi) {
      setErrors(prev => ({
        ...prev,
        instansi: "",
      }));
    }
  };

  const handleInstitutionSelect = (institution: Institution | null) => {
    setSelectedInstitution(institution);
    setFormData(prev => ({
      ...prev,
      institutionId: institution?.id,
    }));
  };

  const handleCategoryChange = (categoryId: number | undefined) => {
    setFormData(prev => ({
      ...prev,
      cooperationCategoryId: categoryId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await createApplicationMutation.mutateAsync({
        applicationTypeCode: activeTab,
        cooperationCategoryId: formData.cooperationCategoryId,
        institutionId: selectedInstitution?.id,
        institutionName: formData.instansi,
        title: `${currentTab.title} - ${formData.instansi}`,
        description: formData.tentang,
        purpose: formData.keperluan,
        about: formData.tentang,
        notes: formData.catatan || undefined,
        contactPerson: formData.nama,
        contactEmail: formData.email,
        contactPhone: formData.contactPerson,
      });

      setSubmissionResult(result);

      // Reset form on success
      setFormData({
        nama: "",
        email: "",
        contactPerson: "",
        instansi: "",
        keperluan: "",
        tentang: "",
        catatan: "",
      });
      setSelectedInstitution(null);

    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const currentTab = tabsConfig[activeTab];

  return (
    <div className="min-h-screen bg-section py-[80px]">
      <div className="py-[100px]">
        <div className="mx-auto px-4 md:px-[75px] w-full max-w-[1280px]">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center gap-[30px] mb-[100px]">
            <div className="flex flex-col gap-2.5">
              <h1 className="text-[32px] md:text-[40px] leading-tight md:leading-[50px] font-bold text-foreground">
                Pengajuan Permohonan
              </h1>
              <p className="text-base md:text-lg leading-7 md:leading-8 font-medium text-gray-700 max-w-[600px]">
                Ajukan permohonan kerjasama dengan Pemerintah Kabupaten Tana Tidung melalui formulir digital yang tersedia.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5">
                <div className="flex justify-center items-center w-[24px] h-[24px] bg-foreground rounded-full">
                  <Image
                    src="/assets/images/icons/ic_check.svg"
                    alt="icon"
                    width={14}
                    height={14}
                    className="brightness-0 invert"
                  />
                </div>
                <p className="text-[14px] font-bold leading-[16px] text-gray-700">
                  Proses digital terpadu
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex justify-center items-center w-[24px] h-[24px] bg-foreground rounded-full">
                  <Image
                    src="/assets/images/icons/ic_check.svg"
                    alt="icon"
                    width={14}
                    height={14}
                    className="brightness-0 invert"
                  />
                </div>
                <p className="text-[14px] font-bold leading-[16px] text-gray-700">
                  Respon cepat & akurat
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-[20px] shadow-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              {/* Vertical Tabs */}
              <div className="lg:w-[280px] bg-gray-50 border-r border-gray-200 lg:border-b-0 border-b">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Jenis Permohonan
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                    {Object.entries(tabsConfig).map(([key, tab]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveTab(key as keyof typeof tabsConfig);
                          // Clear errors and submission status when changing tabs
                          setErrors({});
                          setSubmissionResult(null);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === key
                            ? "bg-primary text-foreground shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 p-6 lg:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {currentTab.title}
                  </h2>
                  <p className="text-gray-600">
                    {currentTab.description}
                  </p>
                </div>

                {/* Submission Result */}
                {submissionResult && (
                  <div className="p-6 rounded-lg border bg-green-50 border-green-200 text-green-800">
                    <div className="flex items-start gap-3">
                      <Image
                        src="/assets/images/icons/ic_check.svg"
                        alt="Success"
                        width={24}
                        height={24}
                        className="text-green-600 mt-0.5"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                          Permohonan Berhasil Dikirim!
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Nomor Tracking:</strong>
                            <span className="ml-2 px-2 py-1 bg-green-100 rounded font-mono">
                              {submissionResult.trackingNumber}
                            </span>
                          </p>
                          <p>Simpan nomor tracking di atas untuk melacak status permohonan Anda.</p>
                          <p>Tim kami akan meninjau permohonan dan memberikan update melalui email.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Status */}
                {createApplicationMutation.isError && (
                  <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/assets/images/icons/ic_close.svg"
                        alt="Error"
                        width={16}
                        height={16}
                        className="text-red-500"
                      />
                      <p className="font-medium">
                        {createApplicationMutation.error?.message || 'Terjadi kesalahan saat mengirim permohonan'}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nama}
                        onChange={(e) => handleInputChange("nama", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                          errors.nama ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.nama && (
                        <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Masukkan alamat email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                          errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Masukkan nomor telepon"
                      />
                      {errors.contactPerson && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instansi <span className="text-red-500">*</span>
                      </label>
                      <AutocompleteInput
                        value={formData.instansi}
                        onChange={handleInstitutionChange}
                        onInstitutionSelect={handleInstitutionSelect}
                        placeholder="Masukkan nama instansi"
                        error={errors.instansi}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Kerjasama
                    </label>
                    <CategorySelector
                      value={formData.cooperationCategoryId}
                      onChange={handleCategoryChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keperluan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.keperluan}
                      onChange={(e) => handleInputChange("keperluan", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                        errors.keperluan ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan keperluan permohonan"
                    />
                    {errors.keperluan && (
                      <p className="text-red-500 text-sm mt-1">{errors.keperluan}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentang <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.tentang}
                      onChange={(e) => handleInputChange("tentang", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none ${
                        errors.tentang ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Jelaskan detail tentang permohonan Anda"
                    />
                    {errors.tentang && (
                      <p className="text-red-500 text-sm mt-1">{errors.tentang}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      rows={3}
                      value={formData.catatan}
                      onChange={(e) => handleInputChange("catatan", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Catatan tambahan (opsional)"
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Dokumen Pendukung
                    </h3>
                    <div className="space-y-4">
                      {currentTab.files.map((file) => (
                        <div key={file.key}>
                          <SecureFileUpload
                            label={file.label}
                            required={file.required}
                            documentType={file.key}
                            accept=".pdf,.doc,.docx"
                            maxSize={5 * 1024 * 1024} // 5MB
                            onUploadSuccess={(result) => {
                              console.log(`File uploaded for ${file.key}:`, result);
                            }}
                            onUploadError={(error) => {
                              console.error(`Upload error for ${file.key}:`, error);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <button
                        type="submit"
                        disabled={createApplicationMutation.isPending}
                        className="w-full sm:w-auto px-8 py-4 bg-primary text-foreground font-semibold rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                      >
                        {createApplicationMutation.isPending && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div>
                        )}
                        {createApplicationMutation.isPending ? "Mengirim..." : "Kirim Permohonan"}
                      </button>

                      <div className="text-sm text-gray-500">
                        <p>Pastikan semua data sudah benar sebelum mengirim</p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}