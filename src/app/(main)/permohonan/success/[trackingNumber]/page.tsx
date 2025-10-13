"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface ApplicationData {
  trackingNumber: string;
  publicToken: string;
  applicationId: string;
  message: string;
  title: string;
  applicantName: string;
  applicantEmail: string;
  cooperationType: string;
  submittedAt: string;
}

export default function PermohonanSuccessPage() {
  const params = useParams();
  const trackingNumber = params.trackingNumber as string;

  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!trackingNumber) {
      setError("Nomor tracking tidak valid");
      setLoading(false);
      return;
    }

    // In a real implementation, you might want to fetch additional data
    // For now, we'll use what we have from the URL
    const mockData: ApplicationData = {
      trackingNumber,
      publicToken: "",
      applicationId: "",
      message: "Permohonan Anda telah berhasil diterima dan akan segera diproses oleh tim kami.",
      title: "MOU - Instansi Contoh",
      applicantName: "John Doe",
      applicantEmail: "john@example.com",
      cooperationType: "MOU",
      submittedAt: new Date().toISOString(),
    };

    // Simulate API call
    setTimeout(() => {
      setApplicationData(mockData);
      setLoading(false);
    }, 500);
  }, [trackingNumber]);

  const copyToClipboard = async () => {
    if (trackingNumber) {
      try {
        await navigator.clipboard.writeText(trackingNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
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
          <p className="text-gray-600">Memuat informasi permohonan...</p>
        </div>
      </div>
    );
  }

  if (error || !applicationData) {
    return (
      <div className="min-h-screen bg-section py-[80px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image
                src="/assets/images/icons/ic_close.svg"
                alt="Error"
                width={32}
                height={32}
                className="text-red-600"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mb-6">{error || "Informasi permohonan tidak ditemukan"}</p>
          </div>
          <Link
            href="/permohonan"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Kembali ke Form Permohonan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-section py-[80px]">
      <div className="py-[100px]">
        <div className="mx-auto px-4 md:px-[75px] w-full max-w-[800px]">
          {/* Success Header */}
          <div className="text-center mb-12 pb-6">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Image
                  src="/assets/images/icons/ic_check.svg"
                  alt="Success"
                  width={48}
                  height={48}
                  className="text-green-600"
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Permohonan Berhasil Dikirim!
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Terima kasih telah mengajukan permohonan kerjasama. Dokumen Anda telah diterima dan akan segera diproses oleh tim kami.
            </p>
          </div>

          {/* Main Success Card */}
          <div className="bg-white rounded-[20px] shadow-xl overflow-hidden mb-8">
            <div
              className="p-6"
              style={{
              background: 'linear-gradient(to right, #2b452c, #4a6d62)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(11, 37, 28, 0.3)'
            }}
            >
              <h2 className="text-xl font-semibold mb-2">Nomor Tracking Anda</h2>
              <p className="text-white/80 text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Simpan nomor ini untuk melacak status permohonan Anda
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl font-mono font-bold tracking-wider">
                    {applicationData.trackingNumber}
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="ml-4 px-4 py-2 bg-white text-foreground rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                >
                  <svg
                    className={`w-5 h-5 ${copied ? 'text-green-600' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {copied ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    )}
                  </svg>
                  {copied ? 'Disalin!' : 'Salin'}
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Jenis Permohonan</h3>
                  <p className="text-lg font-semibold text-gray-900">{applicationData.cooperationType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Waktu Pengajuan</h3>
                  <p className="text-lg text-gray-900">{formatDate(applicationData.submittedAt)}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Apa Selanjutnya?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Verifikasi Dokumen</p>
                      <p className="text-sm text-gray-600">Tim kami akan memverifikasi kelengkapan dokumen yang Anda upload</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Proses Review</p>
                      <p className="text-sm text-gray-600">Permohonan akan ditinjau oleh departemen terkait</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Notifikasi Hasil</p>
                      <p className="text-sm text-gray-600">Anda akan menerima update melalui email atau tracking system</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/track/${applicationData.trackingNumber}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Lacak Status Permohonan
            </Link>

            <Link
              href="/permohonan"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Permohonan Baru
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-12 text-center">
            <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Butuh Bantuan?</h3>
              <p className="text-blue-700 mb-4">
                Jika Anda mengalami kendala atau memiliki pertanyaan, jangan ragu untuk menghubungi kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:admin@tanatidung.go.id"
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Kami
                </a>
                <a
                  href="tel:+628123456789"
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Telepon Kami
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}