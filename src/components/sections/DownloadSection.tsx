"use client";

import React from "react";
import Image from "next/image";

interface DownloadCard {
  id: number;
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  icon: string;
  bgColor: string;
  buttonColor: string;
  buttonText: string;
}

const downloadData: DownloadCard[] = [
  {
    id: 1,
    title: "Formulir Pengajuan MOU",
    description:
      "Form pengajuan Memorandum of Understanding untuk kerjasama antar lembaga atau institusi dengan Pemerintah Kabupaten Tana Tidung.",
    fileType: "Dokumen • PDF",
    fileSize: "2.3 MB",
    icon: "/assets/images/icons/note-2.svg",
    bgColor: "bg-primary",
    buttonColor: "bg-primary hover:bg-primary/90 text-foreground",
    buttonText: "Download Form",
  },
  {
    id: 2,
    title: "Template Surat Kuasa",
    description:
      "Template surat kuasa untuk perwakilan dalam proses kerjasama dan penandatanganan dokumen kerjasama resmi.",
    fileType: "Template • DOCX",
    fileSize: "1.8 MB",
    icon: "/assets/images/icons/device-message.svg",
    bgColor: "bg-blue-100",
    buttonColor: "bg-blue-500 hover:bg-blue-600 text-white",
    buttonText: "Download Template",
  },
  {
    id: 3,
    title: "Panduan Prosedur Kerjasama",
    description:
      "Panduan lengkap prosedur dan tahapan kerjasama dengan Pemerintah Tana Tidung mulai dari pengajuan hingga penandatanganan.",
    fileType: "Panduan • PDF",
    fileSize: "3.1 MB",
    icon: "/assets/images/icons/ic_check.svg",
    bgColor: "bg-green-100",
    buttonColor: "bg-green-500 hover:bg-green-600 text-white",
    buttonText: "Download Panduan",
  },
  {
    id: 4,
    title: "Formulir Evaluasi PKS",
    description:
      "Form evaluasi Perjanjian Kerjasama (PKS) untuk menilai efektivitas dan keberlanjutan program kerjasama yang telah berjalan.",
    fileType: "Evaluasi • PDF",
    fileSize: "1.5 MB",
    icon: "/assets/images/icons/crown.svg",
    bgColor: "bg-orange-100",
    buttonColor: "bg-orange-500 hover:bg-orange-600 text-white",
    buttonText: "Download Form",
  },
];

export default function DownloadSection() {
  return (
    <section className="flex justify-center">
      <div className="mx-auto px-[75px] py-[100px] w-full max-w-[1280px]">
        <div className="flex flex-col gap-[50px]">
          {/* Section Header */}
          <div className="flex flex-col gap-3 items-center">
            <h2 className="text-[50px] text-center leading-[59px] font-bold">
              Download
            </h2>
            <p className="text-lg text-center leading-[21px] font-medium">
              Unduh formulir dan dokumen yang diperlukan untuk kerjasama
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {downloadData.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-[20px] p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-[60px] h-[60px] rounded-full ${card.bgColor}`}
                    >
                      <Image
                        src={card.icon}
                        alt={`${card.title} icon`}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[24px] font-bold text-foreground">
                        {card.title}
                      </h3>
                      <p className="text-[14px] text-gray-600">
                        {card.fileType} • {card.fileSize}
                      </p>
                    </div>
                  </div>
                  <p className="text-[16px] leading-7 text-gray-700">
                    {card.description}
                  </p>
                  <a
                    href="#"
                    className={`inline-flex items-center justify-center gap-3 px-6 py-3 font-semibold rounded-[100px] transition-all duration-300 hover:shadow-lg ${card.buttonColor}`}
                  >
                    <Image
                      src="/assets/images/icons/ic_download.svg"
                      alt="download"
                      width={20}
                      height={20}
                    />
                    {card.buttonText}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="flex flex-col items-center gap-6 bg-section rounded-[20px] p-8">
            <div className="text-center">
              <h3 className="text-[28px] font-bold text-foreground mb-3">
                Butuh Bantuan Pengisian Form?
              </h3>
              <p className="text-[16px] text-gray-700 max-w-[600px]">
                Tim kami siap membantu Anda dalam proses pengisian formulir dan
                prosedur kerjasama. Hubungi kami untuk konsultasi gratis.
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="px-[30px] py-[16px] bg-primary hover:bg-primary/90 text-foreground font-bold rounded-[100px] transition-all duration-300 hover:shadow-primary"
              >
                Konsultasi Gratis
              </a>
              <a
                href="#"
                className="px-[30px] py-[16px] border-2 border-foreground text-foreground font-bold rounded-[100px] transition-all duration-300 hover:bg-foreground hover:text-white"
              >
                Lihat FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
