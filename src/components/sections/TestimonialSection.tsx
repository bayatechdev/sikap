"use client";

import React from "react";
import Image from "next/image";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function TestimonialSection() {
  return (
    <AnimatedSection className="py-[60px] md:py-[100px]" animationType="fadeUp">
      <div className="mx-auto px-4 md:px-0 max-w-[1280px]">
        <div className="flex flex-col lg:flex-row w-full items-center gap-[30px] lg:gap-[70px]">
          {/* Left Image Section */}
          <div className="relative shrink-0 w-full lg:w-[456px] h-[350px] lg:h-[510px]">
            <div className="absolute w-[70%] lg:w-[350px] h-[70%] lg:h-[470px] left-[15%] lg:left-10 bottom-0 rounded-[26px] overflow-hidden">
              <Image
                src="/assets/images/thumbnails/testimonial.png"
                alt="Testimonial"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute w-[100px] lg:w-[174px] top-0 left-0">
              <Image
                src="/assets/images/thumbnails/growth.png"
                alt="Growth"
                width={174}
                height={120}
                className="drop-shadow-custom w-auto h-auto max-w-[100px] lg:max-w-[174px]"
              />
            </div>
            <div className="absolute w-[80px] lg:w-[136px] bottom-[50px] right-0">
              <Image
                src="/assets/images/thumbnails/funding.png"
                alt="Funding"
                width={136}
                height={100}
                className="drop-shadow-custom w-auto h-auto max-w-[80px] lg:max-w-[136px]"
              />
            </div>
          </div>

          {/* Right Content Section */}
          <div className="flex flex-col gap-[30px] flex-1">
            <div className="flex flex-col gap-2.5">
              <p className="max-w-[670px] text-[24px] md:text-[32px] leading-tight md:leading-[46px]">
                <strong>
                  Selamat datang di{" "}
                  <mark className="bg-primary px-1 -mx-1 rounded">SIKAP</mark>,
                </strong>
              </p>
            </div>

            <div className="flex flex-col gap-5 leading-[32px] text-lg text-gray-700">
              <p>
                SIKAP adalah sistem kerjasama berbasis digital yang dihadirkan
                Pemerintah Kab. Tana Tidung dalam rangka mendukung
                penyelenggaraan Sistem Pemerintahan Berbasis Elektronik (SPBE).
              </p>
              <p>
                Sistem informasi ini dibuat untuk mengakomodasi kerjasama yang
                dilakukan oleh Pemerintah Tana Tidung dengan Pemerintah
                Daerah/Lembaga/Pihak Ketiga baik dari dalam negeri maupun luar
                negeri.
              </p>
              <p>
                Selain itu, terdapat data hasil kerjasama yang bisa dimanfaatkan
                untuk media publikasi kerjasama yang telah dilakukan oleh
                Pemerintah Tana Tidung sebagai bentuk perwujudan keterbukaan
                informasi publik yang akuntabel dan transparan dalam mendukung
                tercapainya Pemerintahan yang baik (good governance) untuk
                menjadikan Tana Tidung Semakin Hebat!
              </p>
            </div>

            <div className="text-[16px] leading-[24px] text-gray-600">
              <p className="font-semibold text-foreground">
                Saparudin, S.Pd.I., M.A.P.
              </p>
              <p className="font-normal">Kabag. Pemerintahan</p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
