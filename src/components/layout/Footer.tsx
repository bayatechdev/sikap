'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FooterData } from '@/types';

interface FooterProps {
  footerData: FooterData;
}

export default function Footer({ footerData }: FooterProps) {
  return (
    <footer className="flex justify-center bg-white">
      <div className="w-full max-w-[1280px] px-4 md:px-[75px] py-[60px] md:py-[100px]">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-[156px]">
          {/* Logo and Description */}
          <div className="flex flex-col gap-5 w-full lg:w-[259px]">
            <div className="shrink-0">
              <Image
                src="/assets/images/icons/sikap_dark.svg"
                alt="SIKAP Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-[16px] font-medium leading-[28px] text-gray-700">
              Sistem kerjasama berbasis digital Kabupaten Tana Tidung, yang akuntabel dan transparan
            </p>
            <p className="text-[16px] font-medium leading-[28px] text-gray-600">
              {footerData.copyright}
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-[70px]">
            {/* Informasi Publik Section */}
            <nav className="flex flex-col gap-5">
              <h3 className="font-poppins text-[16px] leading-[24px] font-bold text-foreground">
                {footerData.sections.informasi.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a
                    href="https://tanatidungkab.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Website Resmi
                  </a>
                </li>
                <li>
                  <a
                    href="https://layanan.tanatidungkab.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Layanan Masyarakat
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Berita Terkini
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Pengumuman Resmi
                  </a>
                </li>
              </ul>
            </nav>

            {/* Layanan Kerjasama Section */}
            <nav className="flex flex-col gap-5">
              <h3 className="font-poppins text-[16px] leading-[24px] font-bold text-foreground">
                {footerData.sections.layanan.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link
                    href="/permohonan"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Ajukan Permohonan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/track"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Tracking Status
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#jenis-kerjasama"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Download Dokumen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#sop"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Standar Operasional
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Kebijakan & Informasi Section */}
            <nav className="flex flex-col gap-5">
              <h3 className="font-poppins text-[16px] leading-[24px] font-bold text-foreground">
                {footerData.sections.kebijakan.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a
                    href="/privacy-policy"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-conditions"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Syarat & Ketentuan
                  </a>
                </li>
                <li>
                  <a
                    href="/faq"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                  >
                    Hubungi Kami
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}