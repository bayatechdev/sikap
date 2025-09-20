"use client";

import React from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import VerticalTabs from "@/components/ui/VerticalTabs";
import { SOPData } from "@/types";

interface SOPSectionProps {
  data: SOPData;
}

export default function SOPSection({ data }: SOPSectionProps) {
  return (
    <AnimatedSection className="pb-[60px] md:pb-[100px]" animationType="fadeUp">
      <div id="sop"></div>
      <div className="mx-auto px-4 md:px-[75px] max-w-[1280px]">
        <div className="flex flex-col gap-[30px] md:gap-[50px]">
          {/* Section Header */}
          <div className="flex flex-col gap-3 items-center text-center">
            <h2 className="text-[32px] md:text-[50px] font-bold leading-tight md:leading-[59px] text-foreground">
              Standar Operasional Prosedur
            </h2>
            <p className="text-base md:text-lg leading-relaxed font-medium max-w-[600px] px-4 text-gray-700">
              Panduan lengkap prosedur kerjasama berdasarkan lingkup geografis
              dan regulasi yang berlaku
            </p>
          </div>

          {/* Vertical Tabs */}
          <VerticalTabs data={data} />
        </div>
      </div>
    </AnimatedSection>
  );
}
