"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, FileText, ChevronRight, X } from "lucide-react";



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
  cooperationType: {
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

  // const getStatusColor = (status: string) => {
  //   const colors: Record<string, string> = {
  //     'SUBMITTED': 'bg-blue-100 text-blue-800',
  //     'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
  //     'ADDITIONAL_INFO_REQUIRED': 'bg-orange-100 text-orange-800',
  //     'APPROVED': 'bg-green-100 text-green-800',
  //     'REJECTED': 'bg-red-100 text-red-800'
  //   };
  //   return colors[status] || 'bg-gray-100 text-gray-800';
  // };

  const getStatusInfo = (status: string) => {
    const statusInfo: Record<string, { icon: React.ReactNode; color: string; description: string; nextStep?: string }> = {
      'SUBMITTED': {
        icon: <CheckCircle2 className="w-6 h-6" />,
        color: '#3b82f6',
        description: 'Permohonan Anda telah diterima dan akan segera diproses.',
        nextStep: 'Menunggu review oleh tim kami'
      },
      'UNDER_REVIEW': {
        icon: <Clock className="w-6 h-6" />,
        color: '#f59e0b',
        description: 'Permohonan Anda sedang dalam tahap review.',
        nextStep: 'Tim kami sedang memeriksa kelengkapan dokumen'
      },
      'ADDITIONAL_INFO_REQUIRED': {
        icon: <AlertCircle className="w-6 h-6" />,
        color: '#ea580c',
        description: 'Informasi tambahan diperlukan untuk melanjutkan proses.',
        nextStep: 'Silakan upload dokumen tambahan yang diminta'
      },
      'APPROVED': {
        icon: <CheckCircle2 className="w-6 h-6" />,
        color: '#10b981',
        description: 'Permohonan Anda telah disetujui.',
        nextStep: 'Proses kerjasama dapat dilanjutkan'
      },
      'REJECTED': {
        icon: <AlertCircle className="w-6 h-6" />,
        color: '#ef4444',
        description: 'Permohonan Anda tidak dapat disetujui.',
        nextStep: 'Periksa kembali persyaratan dan ajukan kembali'
      }
    };
    return statusInfo[status] || statusInfo['SUBMITTED'];
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
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Permohonan Tidak Ditemukan</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/track')}
                    className="px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                    style={{
                      backgroundColor: '#b7eb38',
                      color: '#0b251c'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#89a534';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#b7eb38';
                    }}
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={() => router.push('/permohonan')}
                    className="px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
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
              <ArrowLeft />
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
              {/* New Status Overview Card */}
              <div
                className="rounded-[20px] shadow-xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${getStatusInfo(application.status).color}15, ${getStatusInfo(application.status).color}08)`,
                  border: `1px solid ${getStatusInfo(application.status).color}20`
                }}
              >
                {/* Main Status Header */}
                <div
                  className="p-6 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${getStatusInfo(application.status).color}, ${getStatusInfo(application.status).color}dd)`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      {getStatusInfo(application.status).icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {application.timeline.find(t => t.isCurrent)?.label || application.status}
                      </h2>
                      <p className="text-white/80 text-sm">
                        Terakhir diupdate: {formatDate(application.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Details */}
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Status Detail</h3>
                    <p className="text-gray-600">
                      {getStatusInfo(application.status).description}
                    </p>
                    {getStatusInfo(application.status).nextStep && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <ChevronRight className="w-4 h-4" style={{ color: getStatusInfo(application.status).color }} />
                        <span>
                          <strong>Next Step:</strong> {getStatusInfo(application.status).nextStep}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Complete Timeline - All Status History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Status</h3>
                    <div className="space-y-4">
                      {application.statusHistory.map((history, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            history.status === application.status ? 'text-white' : 'bg-gray-300'
                          }`}
                          style={{
                            backgroundColor: history.status === application.status ? getStatusInfo(application.status).color :
                                           application.statusHistory.indexOf(history) < application.statusHistory.findIndex(h => h.status === application.status) ? '#10b981' : '#d1d5db'
                          }}>
                            {application.statusHistory.indexOf(history) < application.statusHistory.findIndex(h => h.status === application.status) ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : history.status === application.status ? (
                              <Clock className="w-4 h-4 text-white" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`font-medium ${
                                history.status === application.status || application.statusHistory.indexOf(history) < application.statusHistory.findIndex(h => h.status === application.status) ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {application.timeline.find(t => t.status === history.status)?.label || history.status}
                              </h4>
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                {formatDate(history.changedAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Oleh: {history.changedBy}</p>
                            {history.notes && (
                              <p className="text-sm text-gray-700 mt-1">{history.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Documents Section - SIKAP Theme */}
              {application.documents.length > 0 && (
                <div className="bg-white rounded-[20px] shadow-xl overflow-hidden">
                  <div
                    className="px-6 py-4"
                    style={{
                      background: 'linear-gradient(135deg, #b7eb3815, #b7eb3808)',
                      borderBottom: `1px solid #b7eb3830`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: '#b7eb3820' }}
                      >
                        <FileText className="w-4 h-4" style={{ color: '#b7eb38' }} />
                      </div>
                      <h2 className="text-lg font-semibold" style={{ color: '#0b251c' }}>
                        Dokumen Terkait
                      </h2>
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: '#b7eb3820',
                          color: '#0b251c'
                        }}
                      >
                        {application.documents.length} file
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {application.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 border rounded-xl transition-all hover:shadow-md"
                          style={{
                            borderColor: '#e5e7eb',
                            backgroundColor: '#ffffff'
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: '#b7eb3810' }}
                            >
                              <FileText className="w-5 h-5" style={{ color: '#b7eb38' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4
                                className="font-medium truncate"
                                style={{ color: '#0b251c' }}
                              >
                                {doc.filename}
                              </h4>
                              <p className="text-xs" style={{ color: '#6b7280' }}>
                                {doc.type} • {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(`/api/documents/${doc.id}/download?token=${application.trackingNumber}`, '_blank')}
                            className="px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 flex-shrink-0 font-medium"
                            style={{
                              backgroundColor: '#b7eb38',
                              color: '#0b251c'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#89a534';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#b7eb38';
                            }}
                          >
                            <FileText className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              </div>

            {/* Sidebar - SIKAP Theme */}
            <div className="space-y-6">
              {/* Application Info */}
              <div className="bg-white rounded-[20px] shadow-xl overflow-hidden">
                <div
                  className="px-6 py-4 border-b"
                  style={{
                    background: 'linear-gradient(135deg, #b7eb3815, #b7eb3808)',
                    borderBottom: `1px solid #b7eb3830`
                  }}
                >
                  <h2 className="text-lg font-semibold" style={{ color: '#0b251c' }}>
                    Informasi Permohonan
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#6b7280' }}>Judul</label>
                    <p style={{ color: '#0b251c' }} className="font-medium">{application.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#6b7280' }}>Jenis</label>
                    <p style={{ color: '#0b251c' }} className="font-medium">{application.cooperationType.name}</p>
                  </div>
                  {application.institution && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: '#6b7280' }}>Instansi</label>
                      <p style={{ color: '#0b251c' }} className="font-medium">{application.institution.name}</p>
                      <p className="text-sm" style={{ color: '#6b7280' }}>{application.institution.type}</p>
                    </div>
                  )}
                  {application.cooperationCategory && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: '#6b7280' }}>Kategori</label>
                      <p style={{ color: '#0b251c' }} className="font-medium">{application.cooperationCategory.name}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#6b7280' }}>Tanggal Pengajuan</label>
                    <p style={{ color: '#0b251c' }} className="font-medium">{formatDate(application.submittedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-[20px] shadow-xl overflow-hidden">
                <div
                  className="px-6 py-4 border-b"
                  style={{
                    background: 'linear-gradient(135deg, #b7eb3815, #b7eb3808)',
                    borderBottom: `1px solid #b7eb3830`
                  }}
                >
                  <h2 className="text-lg font-semibold" style={{ color: '#0b251c' }}>
                    Kontak
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#6b7280' }}>Nama</label>
                    <p style={{ color: '#0b251c' }} className="font-medium">{application.contact.person}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#6b7280' }}>Email</label>
                    <p style={{ color: '#0b251c' }} className="font-medium">{application.contact.email}</p>
                  </div>
                </div>
              </div>

              {/* Refresh Button - SIKAP Theme */}
              <button
                onClick={fetchApplicationData}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl transition-all disabled:opacity-50 font-medium shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: '#b7eb38',
                  color: '#0b251c'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#89a534';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#b7eb38';
                  }
                }}
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