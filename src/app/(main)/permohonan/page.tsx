"use client";

import React, { useState } from "react";
import Image from "next/image";

interface FormData {
  nama: string;
  email: string;
  contactPerson: string;
  instansi: string;
  keperluan: string;
  tentang: string;
  catatan: string;
}

interface FileData {
  [key: string]: File | null;
}

interface FormErrors {
  [key: string]: string;
}

interface SubmissionStatus {
  type: 'success' | 'error' | null;
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
  const [fileData, setFileData] = useState<FileData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
    type: null,
    message: "",
  });

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

    // File validation
    currentTab.files.forEach(file => {
      if (file.required && !fileData[file.key]) {
        newErrors[file.key] = `${file.label} wajib diunggah`;
      }
    });

    // File size validation
    Object.entries(fileData).forEach(([key, file]) => {
      if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors[key] = "Ukuran file tidak boleh lebih dari 5MB";
      }
    });

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

  const handleFileChange = (fileKey: string, file: File | null) => {
    setFileData(prev => ({
      ...prev,
      [fileKey]: file,
    }));

    // Clear error when file is selected
    if (errors[fileKey] && file) {
      setErrors(prev => ({
        ...prev,
        [fileKey]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus({ type: null, message: "" });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.2; // 80% success rate

      if (isSuccess) {
        setSubmissionStatus({
          type: 'success',
          message: 'Permohonan berhasil dikirim! Tim kami akan meninjau dan memberikan respons dalam 2-3 hari kerja.',
        });

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
        setFileData({});
      } else {
        throw new Error('Gagal mengirim permohonan');
      }
    } catch {
      setSubmissionStatus({
        type: 'error',
        message: 'Terjadi kesalahan saat mengirim permohonan. Silakan coba lagi atau hubungi admin.',
      });
    } finally {
      setIsSubmitting(false);
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
                          setSubmissionStatus({ type: null, message: "" });
                          // Reset file data for new tab
                          setFileData({});
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

                {/* Submission Status */}
                {submissionStatus.type && (
                  <div className={`p-4 rounded-lg border ${
                    submissionStatus.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={`/assets/images/icons/${submissionStatus.type === 'success' ? 'ic_check' : 'ic_close'}.svg`}
                        alt={submissionStatus.type}
                        width={16}
                        height={16}
                        className={submissionStatus.type === 'success' ? '' : 'text-red-500'}
                      />
                      <p className="font-medium">{submissionStatus.message}</p>
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
                      <input
                        type="text"
                        required
                        value={formData.instansi}
                        onChange={(e) => handleInputChange("instansi", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                          errors.instansi ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Masukkan nama instansi"
                      />
                      {errors.instansi && (
                        <p className="text-red-500 text-sm mt-1">{errors.instansi}</p>
                      )}
                    </div>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {file.label} {file.required && <span className="text-red-500">*</span>}
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileChange(file.key, e.target.files?.[0] || null)}
                              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-foreground hover:file:bg-primary/90 ${
                                errors[file.key] ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {fileData[file.key] && (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <Image
                                  src="/assets/images/icons/ic_check.svg"
                                  alt="check"
                                  width={16}
                                  height={16}
                                />
                                Terpilih
                              </div>
                            )}
                          </div>
                          {errors[file.key] && (
                            <p className="text-red-500 text-sm mt-1">{errors[file.key]}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Format yang didukung: PDF, DOC, DOCX (Maks. 5MB)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-4 bg-primary text-foreground font-semibold rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                      >
                        {isSubmitting && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div>
                        )}
                        {isSubmitting ? "Mengirim..." : "Kirim Permohonan"}
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