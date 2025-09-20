"use client";

import React from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import TabSystem from "@/components/ui/TabSystem";
import { KerjasamaData } from "@/types";

interface KerjasamaSectionProps {
  data: KerjasamaData;
}

export default function KerjasamaSection({ data }: KerjasamaSectionProps) {
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
