"use client";

import React from "react";
import Image from "next/image";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useWelcomeSettings } from "@/hooks/use-settings";

export default function WelcomeSection() {
  const { loading, error, getSetting } = useWelcomeSettings();

  // Check if welcome section is enabled
  const isEnabled = getSetting('welcome_enabled', 'true') === 'true';

  if (!isEnabled) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <AnimatedSection className="py-[60px] md:py-[100px]" animationType="fadeUp">
        <div className="mx-auto px-4 md:px-0 max-w-[1280px]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  // Error state - fall back to default content
  if (error) {
    console.error('Welcome settings error:', error);
    // Continue with default content below
  }

  // Get dynamic settings with fallbacks matching the original content
  const welcomeTitle = getSetting('welcome_title', 'Selamat datang di SIKAP');
  const personName = getSetting('welcome_person_name', 'Saparudin, S.Pd.I., M.A.P.');
  const personTitle = getSetting('welcome_person_title', 'Kabag. Pemerintahan');
  const welcomeMessage = getSetting('welcome_message',
    'SIKAP adalah sistem kerjasama berbasis digital yang dihadirkan Pemerintah Kab. Tana Tidung dalam rangka mendukung penyelenggaraan Sistem Pemerintahan Berbasis Elektronik (SPBE).\n\n' +
    'Sistem informasi ini dibuat untuk mengakomodasi kerjasama yang dilakukan oleh Pemerintah Tana Tidung dengan Pemerintah Daerah/Lembaga/Pihak Ketiga baik dari dalam negeri maupun luar negeri.\n\n' +
    'Selain itu, terdapat data hasil kerjasama yang bisa dimanfaatkan untuk media publikasi kerjasama yang telah dilakukan oleh Pemerintah Tana Tidung sebagai bentuk perwujudan keterbukaan informasi publik yang akuntabel dan transparan dalam mendukung tercapainya Pemerintahan yang baik (good governance) untuk menjadikan Tana Tidung Semakin Hebat!'
  );
  const welcomePhoto = getSetting('welcome_photo', '/assets/images/thumbnails/testimonial.png');

  return (
    <AnimatedSection className="py-[60px] md:py-[100px]" animationType="fadeUp">
      <div className="mx-auto px-4 md:px-0 max-w-[1280px]">
        <div className="flex flex-col lg:flex-row w-full items-center gap-[30px] lg:gap-[70px]">
          {/* Left Image Section */}
          <div className="relative shrink-0 w-full lg:w-[456px] h-[350px] lg:h-[510px]">
            <div className="absolute w-[70%] lg:w-[350px] h-[70%] lg:h-[470px] left-[15%] lg:left-10 bottom-0 rounded-[26px] overflow-hidden">
              <Image
                src={welcomePhoto}
                alt={`${personName} - ${personTitle}`}
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
                  {welcomeTitle.includes('SIKAP') ? (
                    <>
                      {welcomeTitle.replace('SIKAP', '')}{" "}
                      <mark className="bg-primary px-1 -mx-1 rounded">SIKAP</mark>
                      {welcomeTitle.endsWith('SIKAP') ? '' : ','}
                    </>
                  ) : (
                    welcomeTitle
                  )}
                </strong>
              </p>
            </div>

            <div className="flex flex-col gap-5 leading-[32px] text-lg text-gray-700">
              {welcomeMessage.split('\n\n').map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>

            {personName && (
              <div className="text-[16px] leading-[24px] text-gray-600">
                <p className="font-semibold text-foreground">
                  {personName}
                </p>
                {personTitle && (
                  <p className="font-normal">{personTitle}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}