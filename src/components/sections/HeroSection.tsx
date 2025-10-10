"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useHeroSettings, usePartners, useHeroSlides } from "@/hooks/use-settings";
import HeroCarousel from "@/components/ui/HeroCarousel";
import { HeroSection as HeroData } from "@/types";
import { HeroSkeleton } from "@/components/ui/skeleton-variants";

interface HeroSectionProps {
  data?: HeroData; // Made optional for backward compatibility
}

export default function HeroSection({ data }: HeroSectionProps) {
  const { loading: settingsLoading, error: settingsError, getSetting } = useHeroSettings();
  const { heroSlides, loading: slidesLoading, error: slidesError } = useHeroSlides();
  const { partners } = usePartners();

  const loading = settingsLoading || slidesLoading;
  const error = settingsError || slidesError;

  // Global settings for fallback
  const globalHeroTitle = getSetting('hero_title', data?.title || 'Selamat datang di Website SIKAP');
  const globalHeroSubtitle = getSetting('hero_subtitle', data?.subtitle || 'Sistem kerjasama berbasis digital Kabupaten Tana Tidung yang akuntabel dan transparan');
  const primaryButton = getSetting('hero_primary_button', data?.cta?.primary || 'Ajukan Kerjasama');
  const secondaryButton = getSetting('hero_secondary_button', data?.cta?.secondary || 'Lihat Data');

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
    },
  };

  // Loading state
  if (loading) {
    return <HeroSkeleton />;
  }

  // Error state
  if (error) {
    console.error('Hero settings error:', error);
    // Fall back to default content on error
  }

  return (
    <>
      {/* Hero Carousel */}
      {heroSlides && heroSlides.length > 0 && (
        <HeroCarousel
          slides={heroSlides}
          globalTitle={globalHeroTitle}
          globalSubtitle={globalHeroSubtitle}
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
          autoPlayInterval={6000}
        />
      )}

      {/* Partners Section - Always at the bottom */}
      {partners.length > 0 && (
        <section className="bg-section w-full py-16">
          <div className="relative flex justify-center">
            <div className="flex flex-col gap-[30px] px-4 md:px-[75px] max-w-[1280px] w-full">
              <motion.div
                className="flex flex-col gap-[30px] items-center"
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
            </div>
          </div>
        </section>
      )}
    </>
  );
}
