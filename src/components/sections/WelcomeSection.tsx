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

  // Validate and format welcome photo URL for Next.js Image component
  const getValidatedPhotoUrl = (photoPath: string) => {
    if (!photoPath || photoPath === '') {
      return '/assets/images/thumbnails/testimonial.png'; // fallback
    }

    // If it's already a full URL (starts with http), return as is
    if (photoPath.startsWith('http')) {
      return photoPath;
    }

    // If it doesn't start with /uploads/, add it
    if (!photoPath.startsWith('/uploads/')) {
      return `/uploads/${photoPath}`;
    }

    return photoPath;
  };

  const validatedPhotoUrl = getValidatedPhotoUrl(welcomePhoto);

  return (
    <AnimatedSection className="py-[60px] md:py-[100px]" animationType="fadeUp">
      <div className="mx-auto px-4 md:px-0 max-w-[1280px]">
        <div className="flex flex-col lg:flex-row w-full items-center gap-[30px] lg:gap-[70px]">
          {/* Left Image Section */}
          <div className="relative shrink-0 w-full lg:w-[456px] h-[350px] lg:h-[510px]">
            <div className="absolute w-[70%] lg:w-[350px] h-[70%] lg:h-[470px] left-[15%] lg:left-10 bottom-0 rounded-[26px] overflow-hidden">
              <Image
                src={validatedPhotoUrl}
                alt={`${personName} - ${personTitle}`}
                fill
                className="object-cover"
              />
            </div>
            {/* Thumbnail Images */}
            <div className="absolute  p-6 bg-white rounded-2xl shadow-2xl text-accent-foreground">
              <div className="flex gap-4 items-center">
                <div className="flex items-center justify-center bg-primary rounded-full w-[50px] h-[50px] shrink-0">
                  <Image
                    src="/assets/images/icons/crown.svg"
                    alt="crown icon"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-poppins text-[12px] lg:text-[22px] leading-[22px] font-semibold">
                    Welcome
                  </h3>
                  <p className="text-[16px]">
                    to <span className="font-bold">SIKAP</span>
                  </p>
                </div>
              </div>
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