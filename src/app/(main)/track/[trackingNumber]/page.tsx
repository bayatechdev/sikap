"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

interface StatusHistory {
  status: string;
  previousStatus: string | null;
  notes: string | null;
  changedAt: string;
  changedBy: string;
}

interface Document {
  id: string;
  filename: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface TimelineItem {
  status: string;
  label: string;
  completed: boolean;
  date: string | null;
  notes: string | null;
  isCurrent: boolean;
}

interface ApplicationData {
  trackingNumber: string;
  title: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  applicationType: {
    name: string;
    code: string;
  };
  institution: {
    name: string;
    type: string;
  } | null;
  cooperationCategory: {
    name: string;
  } | null;
  contact: {
    person: string;
    email: string;
  };
  statusHistory: StatusHistory[];
  documents: Document[];
  timeline: TimelineItem[];
}

export default function TrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trackingNumber = params.trackingNumber as string;

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingNumber) {
      fetchApplicationData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingNumber]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/track/${trackingNumber}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch application data');
      }

      const data = await response.json();
      setApplication(data.application);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'SUBMITTED': 'bg-blue-100 text-blue-800',
      'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
      'ADDITIONAL_INFO_REQUIRED': 'bg-orange-100 text-orange-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-section py-[80px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Mengambil data permohonan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-section py-[80px]">
        <div className="py-[100px]">
          <div className="mx-auto px-4 md:px-[75px] w-full max-w-[800px]">
            <div className="bg-white rounded-[20px] shadow-lg overflow-hidden p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="/assets/images/icons/ic_close.svg"
                    alt="Error"
                    width={24}
                    height={24}
                    className="text-red-500"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Permohonan Tidak Ditemukan</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/track')}
                    className="px-6 py-3 bg-primary text-foreground rounded-lg hover:shadow-lg transition-all"
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={() => router.push('/permohonan')}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Buat Permohonan Baru
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="min-h-screen bg-section py-[80px]">
      <div className="py-[100px]">
        <div className="mx-auto px-4 md:px-[75px] w-full max-w-[1200px]">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/track')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <Image
                src="/assets/images/icons/ic_arrow_left.svg"
                alt="Back"
                width={16}
                height={16}
              />
              Kembali ke Pencarian
            </button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Detail Permohonan
            </h1>
            <p className="text-gray-600">
              Tracking Number: <span className="font-mono font-semibold">{application.trackingNumber}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Overview */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Status Permohonan</h2>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {application.timeline.find(t => t.isCurrent)?.label || application.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Terakhir diupdate: {formatDate(application.updatedAt)}
                  </span>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  {application.timeline.map((item) => (
                    <div key={item.status} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-green-500' : item.isCurrent ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                        {item.completed ? (
                          <Image
                            src="/assets/images/icons/ic_check.svg"
                            alt="Completed"
                            width={16}
                            height={16}
                            className="brightness-0 invert"
                          />
                        ) : (
                          <span className={`w-2 h-2 rounded-full ${
                            item.isCurrent ? 'bg-white' : 'bg-gray-500'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          item.completed || item.isCurrent ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {item.label}
                        </h3>
                        {item.date && (
                          <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              {application.documents.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Dokumen</h2>
                  <div className="space-y-3">
                    {application.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Image
                              src="/assets/images/icons/ic_document.svg"
                              alt="Document"
                              width={20}
                              height={20}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.filename}</h4>
                            <p className="text-sm text-gray-500">
                              {doc.type} • {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status History */}
              {application.statusHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Riwayat Status</h2>
                  <div className="space-y-4">
                    {application.statusHistory.map((history, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {application.timeline.find(t => t.status === history.status)?.label || history.status}
                          </h4>
                          <span className="text-sm text-gray-500">{formatDate(history.changedAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600">Oleh: {history.changedBy}</p>
                        {history.notes && (
                          <p className="text-sm text-gray-700 mt-1">{history.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Informasi Permohonan</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Judul</label>
                    <p className="text-gray-900">{application.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Jenis</label>
                    <p className="text-gray-900">{application.applicationType.name}</p>
                  </div>
                  {application.institution && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Instansi</label>
                      <p className="text-gray-900">{application.institution.name}</p>
                      <p className="text-sm text-gray-600">{application.institution.type}</p>
                    </div>
                  )}
                  {application.cooperationCategory && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kategori</label>
                      <p className="text-gray-900">{application.cooperationCategory.name}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tanggal Pengajuan</label>
                    <p className="text-gray-900">{formatDate(application.submittedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Kontak</h2>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nama</label>
                    <p className="text-gray-900">{application.contact.person}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{application.contact.email}</p>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchApplicationData}
                disabled={loading}
                className="w-full px-4 py-3 bg-primary text-foreground rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Memuat...' : 'Refresh Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}