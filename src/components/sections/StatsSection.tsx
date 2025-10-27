'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AnimatedSection from '@/components/ui/AnimatedSection';

interface StatsData {
  totalCooperations: number;
  totalPartners: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatsData>({
    totalCooperations: 456,
    totalPartners: 123
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalCooperations: data.stats.totalCooperations || 0,
            totalPartners: data.stats.totalPartners || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format number with separator
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };
  return (
    <AnimatedSection
      className="flex justify-center h-auto lg:h-[216px] bg-foreground"
      animationType="fadeUp"
    >
      <div className="relative flex w-full max-w-[1280px] px-4 lg:px-[75px] py-[30px] lg:py-[50px] overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full text-white gap-8">
          <h2 className="text-[24px] lg:text-[32px] z-10 leading-tight lg:leading-[46px] font-bold max-w-[425px] text-center lg:text-left">
            Bersama membangun Kabupaten Tana Tidung
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-20">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center w-[50px] h-[50px] bg-primary rounded-full shrink-0">
                <Image
                  src="/assets/images/icons/3dcube.svg"
                  alt="cube icon"
                  width={24}
                  height={24}
                />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-poppins text-[32px] lg:text-[42px] leading-[46px] font-bold">
                  {loading ? '...' : formatNumber(stats.totalCooperations)}
                </h3>
                <p className="text-lg leading-8">
                  Kerjasama
                </p>
              </div>
            </div>

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
                <h3 className="font-poppins text-[32px] lg:text-[42px] leading-[46px] font-bold">
                  {loading ? '...' : formatNumber(stats.totalPartners)}
                </h3>
                <p className="text-lg leading-8">
                  Partner
                </p>
              </div>
            </div>
          </div>
        </div>
        <Image
          src="/assets/images/backgrounds/bg-stats.svg"
          alt="background"
          width={345}
          height={248}
          className="absolute right-0 lg:left-[227px] h-[150px] lg:h-[248px] w-auto -top-[16px] opacity-20 lg:opacity-100"
        />
      </div>
    </AnimatedSection>
  );
}