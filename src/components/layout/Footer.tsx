'use client';

import React from 'react';
import Image from 'next/image';
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
            {/* Product Section */}
            <nav className="flex flex-col gap-5">
              <h3 className="font-poppins text-[16px] leading-[24px] font-bold text-foreground">
                {footerData.sections.product.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {footerData.sections.product.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Company Section */}
            <nav className="flex flex-col gap-5">
              <h3 className="font-poppins text-[16px] leading-[24px] font-bold text-foreground">
                {footerData.sections.company.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {footerData.sections.company.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Developer Section */}
            <nav className="flex flex-col gap-5">
              <h3 className="font-poppins text-[16px] leading-[24px] font-bold text-foreground">
                {footerData.sections.developer.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {footerData.sections.developer.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-[16px] leading-7 font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}