"use client";

import React, { useEffect, useState } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import TabSystem from "@/components/ui/TabSystem";
import { KerjasamaData } from "@/types";

interface KerjasamaSectionProps {
  // Make data optional since we'll fetch it from API
  data?: KerjasamaData;
}

export default function KerjasamaSection({ data: staticData }: KerjasamaSectionProps) {
  const [data, setData] = useState<KerjasamaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCooperationTypes = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch('/api/cooperation-types/homepage');
        if (response.ok) {
          const apiData = await response.json();
          setData(apiData);
        } else {
          // Fallback to static data if API fails
          if (staticData) {
            setData(staticData);
          }
        }
      } catch (error) {
        console.error('Error fetching cooperation types:', error);
        // Fallback to static data if API fails
        if (staticData) {
          setData(staticData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCooperationTypes();
  }, [staticData]);

  if (loading) {
    return (
      <AnimatedSection
        className="py-[60px] md:py-[100px] bg-section"
        animationType="fadeUp"
      >
        <div id="cooperation"></div>
        <div className="mx-auto px-4 md:px-[75px] max-w-[1280px]">
          <div className="flex flex-col gap-[30px] md:gap-[50px]">
            {/* Section Header */}
            <div className="flex flex-col gap-3 items-center text-center">
              <h2 className="text-[32px] md:text-[50px] font-bold leading-tight md:leading-[59px] text-foreground">
                Jenis Kerjasama
              </h2>
              <p className="text-base md:text-lg leading-relaxed font-medium max-w-[600px] text-gray-700">
                Berbagai bentuk kerjasama yang dapat dijalin dengan Pemerintah
                Kabupaten Tana Tidung
              </p>
            </div>

            {/* Loading Skeleton */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-pulse bg-gray-200 h-12 w-80 rounded-lg"></div>
              </div>
              <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (!data) {
    return (
      <AnimatedSection
        className="py-[60px] md:py-[100px] bg-section"
        animationType="fadeUp"
      >
        <div id="cooperation"></div>
        <div className="mx-auto px-4 md:px-[75px] max-w-[1280px]">
          <div className="flex flex-col gap-[30px] md:gap-[50px]">
            {/* Section Header */}
            <div className="flex flex-col gap-3 items-center text-center">
              <h2 className="text-[32px] md:text-[50px] font-bold leading-tight md:leading-[59px] text-foreground">
                Jenis Kerjasama
              </h2>
              <p className="text-base md:text-lg leading-relaxed font-medium max-w-[600px] text-gray-700">
                Berbagai bentuk kerjasama yang dapat dijalin dengan Pemerintah
                Kabupaten Tana Tidung
              </p>
            </div>

            {/* Error State */}
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak dapat memuat data kerjasama</p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    );
  }
  return (
    <AnimatedSection
      className="py-[60px] md:py-[100px] bg-section"
      animationType="fadeUp"
    >
      <div id="cooperation"></div>
      <div className="mx-auto px-4 md:px-[75px] max-w-[1280px]">
        <div className="flex flex-col gap-[30px] md:gap-[50px]">
          {/* Section Header */}
          <div className="flex flex-col gap-3 items-center text-center">
            <h2 className="text-[32px] md:text-[50px] font-bold leading-tight md:leading-[59px] text-foreground">
              Jenis Kerjasama
            </h2>
            <p className="text-base md:text-lg leading-relaxed font-medium max-w-[600px] text-gray-700">
              Berbagai bentuk kerjasama yang dapat dijalin dengan Pemerintah
              Kabupaten Tana Tidung
            </p>
          </div>

          {/* Tab System */}
          <TabSystem data={data} />
        </div>
      </div>
    </AnimatedSection>
  );
}
