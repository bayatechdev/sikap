"use client";

import React, { useState, useEffect } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import VerticalTabs from "@/components/ui/VerticalTabs";
import { SOPData } from "@/types";

interface SOPSectionProps {
  data?: SOPData;
}

export default function SOPSection({ data: initialData }: SOPSectionProps) {
  const [data, setData] = useState<SOPData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/sop-documents/homepage');

        if (!response.ok) {
          throw new Error('Failed to fetch SOP documents');
        }

        const sopData: SOPData = await response.json();
        setData(sopData);
      } catch (err) {
        console.error('Error fetching SOP data:', err);
        setError('Failed to load SOP documents');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData]);

  if (loading) {
    return (
      <AnimatedSection className="pb-[60px] md:pb-[100px]" animationType="fadeUp">
        <div id="sop"></div>
        <div className="mx-auto px-4 md:px-[75px] max-w-[1280px]">
          <div className="flex flex-col gap-[30px] md:gap-[50px]">
            <div className="flex flex-col gap-3 items-center text-center">
              <h2 className="text-[32px] md:text-[50px] font-bold leading-tight md:leading-[59px] text-foreground">
                Standar Operasional Prosedur
              </h2>
              <p className="text-base md:text-lg leading-relaxed font-medium max-w-[600px] px-4 text-gray-700">
                Memuat SOP dokumen...
              </p>
            </div>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (error || !data) {
    return (
      <AnimatedSection className="pb-[60px] md:pb-[100px]" animationType="fadeUp">
        <div id="sop"></div>
        <div className="mx-auto px-4 md:px-[75px] max-w-[1280px]">
          <div className="flex flex-col gap-[30px] md:gap-[50px]">
            <div className="flex flex-col gap-3 items-center text-center">
              <h2 className="text-[32px] md:text-[50px] font-bold leading-tight md:leading-[59px] text-foreground">
                Standar Operasional Prosedur
              </h2>
              <p className="text-base md:text-lg leading-relaxed font-medium max-w-[600px] px-4 text-gray-700">
                {error || 'Tidak dapat memuat SOP dokumen'}
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    );
  }
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
