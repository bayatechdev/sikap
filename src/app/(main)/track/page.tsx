"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      setError("Nomor tracking wajib diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    // Validate tracking number format (SIKAP-YYYYMM-XXXX)
    const trackingPattern = /^SIKAP-\d{6}-\d{4}$/;
    if (!trackingPattern.test(trackingNumber.trim())) {
      setError("Format nomor tracking tidak valid. Contoh: SIKAP-202501-0001");
      setIsLoading(false);
      return;
    }

    // Redirect to tracking detail page
    router.push(`/track/${trackingNumber.trim()}`);
  };

  return (
    <div className="min-h-screen bg-section py-[80px]">
      <div className="py-[100px]">
        <div className="mx-auto px-4 md:px-[75px] w-full max-w-[800px]">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center gap-[30px] mb-[60px]">
            <div className="flex flex-col gap-2.5">
              <h1 className="text-[32px] md:text-[40px] leading-tight md:leading-[50px] font-bold text-foreground">
                Lacak Status Permohonan
              </h1>
              <p className="text-base md:text-lg leading-7 md:leading-8 font-medium text-gray-700 max-w-[600px]">
                Masukkan nomor tracking untuk melihat status terkini permohonan kerjasama Anda dengan Pemerintah Kabupaten Tana Tidung.
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
                  Real-time tracking
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
                  Update otomatis
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Form */}
          <div className="bg-white rounded-[20px] shadow-lg overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Masukkan Nomor Tracking
                </h2>
                <p className="text-gray-600">
                  Nomor tracking Anda dapat ditemukan di email konfirmasi atau receipt permohonan.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Tracking <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => {
                      setTrackingNumber(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="SIKAP-202501-0001"
                    className={`w-full px-4 py-4 border rounded-lg text-lg font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    Format: SIKAP-YYYYMM-XXXX (contoh: SIKAP-202501-0001)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-8 py-4 bg-primary text-foreground font-semibold rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div>
                  )}
                  {isLoading ? "Mencari..." : "Lacak Permohonan"}
                </button>
              </form>

              {/* Help Section */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tidak menemukan nomor tracking?
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Periksa email konfirmasi yang dikirim setelah pengajuan permohonan</p>
                  <p>• Nomor tracking diberikan setelah permohonan berhasil dikirim</p>
                  <p>• Jika masih bermasalah, hubungi customer service kami</p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <a
                    href="/permohonan"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-center"
                  >
                    Buat Permohonan Baru
                  </a>
                  <a
                    href="mailto:support@tanatidungkab.go.id"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Hubungi Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}