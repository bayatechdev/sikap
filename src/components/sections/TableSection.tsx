'use client';

import React from 'react';
import Image from 'next/image';

interface TableRowData {
  no: number;
  tentang: string;
  jenis: string;
  jenisColor: string;
  opd: string;
  waktu: string;
  tempat: string;
}

const tableData: TableRowData[] = [
  {
    no: 1,
    tentang: 'Kerjasama Bidang Pendidikan',
    jenis: 'MOU',
    jenisColor: 'primary',
    opd: 'Dinas Pendidikan',
    waktu: '2024-01-15',
    tempat: 'Tana Tidung'
  },
  {
    no: 2,
    tentang: 'Kerjasama Bidang Kesehatan',
    jenis: 'PKS',
    jenisColor: 'blue',
    opd: 'Dinas Kesehatan',
    waktu: '2024-02-20',
    tempat: 'Sesayap'
  },
  {
    no: 3,
    tentang: 'Kerjasama Pembangunan Infrastruktur',
    jenis: 'Nota Kesepakatan',
    jenisColor: 'green',
    opd: 'PUPR',
    waktu: '2024-03-10',
    tempat: 'Tana Tidung'
  }
];

export default function TableSection() {
  const getBadgeClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary text-foreground';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="bg-section">
      <div className="py-[100px]">
        <div className="mx-auto px-4 md:px-[140px] w-full max-w-[1280px]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-[30px] mb-[100px]">
            <div className="flex flex-col gap-[30px] w-full lg:w-[480px]">
              <div className="flex flex-col gap-2.5">
                <h2 className="text-[24px] md:text-[32px] leading-tight md:leading-[46px] font-bold text-foreground">
                  Data Kerjasama Terkini
                </h2>
                <p className="text-base md:text-lg leading-7 md:leading-8 font-medium text-gray-700">
                  Lihat data lengkap kerjasama yang telah dilakukan dengan berbagai pihak untuk pembangunan Tana Tidung.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <a
                  href="#"
                  className="px-[30px] py-[20px] bg-primary hover:bg-primary/90 rounded-[100px] text-[16px] font-bold leading-[19px] w-fit transition-all duration-300 hover:shadow-primary"
                >
                  Lihat Semua Data
                </a>
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
                    Data terupdate real-time
                  </p>
                </div>
              </div>
            </div>

            <div className="relative shrink-0 w-full lg:w-[570px] h-[300px] lg:h-[392px] bg-gradient-to-br from-primary/20 to-foreground/10 rounded-[20px] flex items-center justify-center border border-primary/30">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Image
                    src="/assets/images/icons/3dcube.svg"
                    alt="data icon"
                    width={32}
                    height={32}
                  />
                </div>
                <p className="text-foreground font-semibold text-lg">Visualisasi Data</p>
                <p className="text-gray-600 text-sm mt-2">Dashboard interaktif akan hadir segera</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-[20px]">
            <table className="w-full border-collapse bg-white rounded-[20px] shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-foreground text-white">
                  <th className="px-6 py-4 text-left text-[14px] font-semibold">No</th>
                  <th className="px-6 py-4 text-left text-[14px] font-semibold">Tentang</th>
                  <th className="px-6 py-4 text-left text-[14px] font-semibold">Jenis</th>
                  <th className="px-6 py-4 text-left text-[14px] font-semibold">OPD Terkait</th>
                  <th className="px-6 py-4 text-left text-[14px] font-semibold">Waktu</th>
                  <th className="px-6 py-4 text-left text-[14px] font-semibold">Tempat</th>
                  <th className="px-6 py-4 text-left text-[14px] font-semibold">File</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={row.no} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${index === tableData.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 py-4 text-[14px] font-semibold text-gray-900">{row.no}</td>
                    <td className="px-6 py-4 text-[14px] text-gray-800 font-medium">{row.tentang}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${getBadgeClasses(row.jenisColor)}`}>
                        {row.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-800">{row.opd}</td>
                    <td className="px-6 py-4 text-[14px] text-gray-700">{row.waktu}</td>
                    <td className="px-6 py-4 text-[14px] text-gray-700">{row.tempat}</td>
                    <td className="px-6 py-4">
                      <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-primary hover:text-foreground rounded-lg text-[12px] font-semibold text-gray-700 transition-all duration-200 hover:shadow-sm">
                        <Image
                          src="/assets/images/icons/ic_download.svg"
                          alt="download"
                          width={16}
                          height={16}
                        />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}