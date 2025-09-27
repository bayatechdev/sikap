"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useHeroSettings, usePartners } from "@/hooks/use-settings";
import HeroSlider from "@/components/ui/HeroSlider";
import { HeroSection as HeroData } from "@/types";
import { HeroImage } from "@/components/ui/HeroImageManager";

interface HeroSectionProps {
  data?: HeroData; // Made optional for backward compatibility
}

export default function HeroSection({ data }: HeroSectionProps) {
  const { loading, error, getSetting } = useHeroSettings();
  const { partners } = usePartners();

  // Fallback to data prop if available
  const heroTitle = getSetting('hero_title', data?.title || 'Selamat datang di Website SIKAP');
  const heroSubtitle = getSetting('hero_subtitle', data?.subtitle || 'Sistem kerjasama berbasis digital Kabupaten Tana Tidung yang akuntabel dan transparan');
  const primaryButton = getSetting('hero_primary_button', data?.cta?.primary || 'Ajukan Kerjasama');
  const secondaryButton = getSetting('hero_secondary_button', data?.cta?.secondary || 'Lihat Data');
  // Parse hero_images JSON string safely
  const parseHeroImages = (): HeroImage[] => {
    try {
      const heroImagesString = getSetting('hero_images', '[]');

      if (!heroImagesString || typeof heroImagesString !== 'string') {
        return [];
      }

      const parsed = JSON.parse(heroImagesString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing hero images in HeroSection:', error);
      return [];
    }
  };

  const heroImages = parseHeroImages();

  const leftVariants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
    },
  };

  // Loading state
  if (loading) {
    return (
      <header id="home" className="bg-section w-full pb-[70px] pt-[200px]">
        <div className="relative flex justify-center">
          <div className="flex flex-col gap-[30px] px-4 md:px-[75px] max-w-[1280px] w-full">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Error state
  if (error) {
    console.error('Hero settings error:', error);
    // Fall back to default content on error
  }

  return (
    <header id="home" className="bg-section w-full pb-[70px] pt-[200px]">
      <div className="relative flex justify-center">
        <div className="flex flex-col gap-[30px] px-4 md:px-[75px] max-w-[1280px] w-full">
          {/* Main Hero Content */}
          <div className="flex flex-col lg:flex-row gap-[30px]">
            {/* Left Content */}
            <motion.div
              className="flex flex-col gap-[30px] w-full lg:w-[550px] shrink-0 py-8 lg:py-[92px]"
              variants={leftVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <h1 className="text-[32px] md:text-6xl font-extrabold leading-tight md:leading-[70px]">
                {heroTitle.replace('SIKAP', '')}{" "}
                <span className="bg-primary inline-flex -mx-1 items-center justify-center px-3 py-2 md:h-14 rounded">
                  SIKAP
                </span>
              </h1>
              <p className="max-w-[484px] text-lg leading-8 font-medium text-gray-700">
                {heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5">
                <button className="px-[30px] py-[20px] rounded-[100px] bg-primary text-[16px] font-bold leading-[19px] transition-all duration-300 hover:shadow-primary hover:-translate-y-1">
                  {primaryButton}
                </button>
                <button className="px-[30px] py-[20px] rounded-[100px] border border-foreground text-[16px] font-bold leading-[19px] transition-all duration-300 hover:ring-2 hover:ring-primary hover:bg-primary hover:border-primary hover:text-foreground">
                  {secondaryButton}
                </button>
              </div>
            </motion.div>

            {/* Right Content - Hero Slider */}
            <motion.div
              className="relative shrink-0 w-full lg:w-[550px] h-[400px] lg:h-[507px]"
              variants={rightVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              {/* Hero Image Slider with rounded corners */}
              <div className="absolute ml-4 mr-4 lg:ml-[52px] lg:mr-[51px] w-[calc(100%-32px)] lg:w-[447px] h-full lg:h-[506px] rounded-[26px] overflow-hidden">
                <HeroSlider
                  images={heroImages}
                  autoPlayInterval={6000}
                  className="w-full h-full"
                />
              </div>

              {/* Review Card - overflow on the left side */}
              <div className="absolute bottom-[20px] lg:bottom-[68px] left-0 w-[200px] lg:w-[316px] h-auto z-10">
                <Image
                  src="/assets/images/thumbnails/review.png"
                  alt="Review"
                  width={316}
                  height={150}
                  className="drop-shadow-custom w-auto h-auto"
                />
              </div>

              {/* Badge Card - overflow on the right side */}
              <div className="absolute top-[20px] lg:top-[77px] right-0 w-[80px] lg:w-[136px] h-auto z-10">
                <Image
                  src="/assets/images/thumbnails/badge.png"
                  alt="Badge"
                  width={136}
                  height={120}
                  className="drop-shadow-custom w-auto h-auto"
                />
              </div>
            </motion.div>
          </div>

          {/* Partners Section */}
          {partners.length > 0 && (
            <motion.div
              className="flex flex-col gap-[30px] items-center mt-16"
              variants={scaleVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.8, ease: "easeInOut", delay: 0.6 }}
            >
              <h2 className="max-w-[370px] font-bold text-[24px] md:text-[32px] leading-[46px] text-center">
                Partner Kami
              </h2>
              <div className="flex w-full justify-center gap-8 lg:gap-[70px] h-[42px]">
                {partners.slice(0, 5).map((partner) => (
                  <div key={partner.id} className="relative flex-1">
                    <div className="relative w-full h-full">
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        fill
                        className="object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
                        title={partner.name}
                      />
                    </div>
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0"
                        aria-label={`Visit ${partner.name} website`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
