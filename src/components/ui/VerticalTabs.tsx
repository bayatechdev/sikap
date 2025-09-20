"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SOPData, SOPType } from "@/types";

interface VerticalTabsProps {
  data: SOPData;
}

interface SOPCardProps {
  data: SOPType;
}

const SOPCard: React.FC<SOPCardProps> = ({ data }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          gradient: "from-black/50 to-transparent",
          dot: "bg-primary",
          button:
            "bg-primary hover:bg-primary/90 text-foreground hover:shadow-primary",
        };
      case "blue":
        return {
          gradient: "from-blue-900/50 to-transparent",
          dot: "bg-blue-400",
          button: "bg-blue-500 hover:bg-blue-600 text-white",
        };
      default:
        return {
          gradient: "from-black/50 to-transparent",
          dot: "bg-primary",
          button:
            "bg-primary hover:bg-primary/90 text-foreground hover:shadow-primary",
        };
    }
  };

  const colors = getColorClasses(data.color);

  return (
    <div className="bg-white rounded-[16px] md:rounded-[20px] shadow-lg border border-gray-200 overflow-hidden">
      {/* Image Section */}
      <div className="relative w-full overflow-hidden">
        <Image
          src={data.image}
          alt={data.title}
          width={400}
          height={300}
          className="w-full h-auto hover:scale-105 transition-transform duration-500"
        />
        {/* <div
          className={`absolute inset-0 bg-gradient-to-t ${colors.gradient}`}
        ></div>
        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
          <div className="flex items-center gap-2 text-white/80 text-[10px] md:text-[12px] mb-1 md:mb-2">
            <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
            <span>{data.category}</span>
          </div>
          <h3 className="text-[18px] md:text-[24px] font-bold text-white mb-2 leading-tight">
            {data.title}
          </h3>
        </div> */}
      </div>

      {/* Content Section */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <p className="text-[14px] md:text-[16px] leading-6 md:leading-7 text-gray-700 line-clamp-3">
            {data.description}
          </p>

          {/* Features */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {data.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`}
                ></div>
                <span className="text-[12px] md:text-[14px] text-gray-700">
                  {feature}
                </span>
              </div>
            ))}
          </div> */}

          {/* Action Area */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] md:text-[12px] text-gray-500">
                {data.downloadInfo.fileType} • {data.downloadInfo.fileSize}
              </p>
              <p className="text-[10px] md:text-[12px] text-gray-500">
                Terakhir diperbarui: {data.downloadInfo.lastUpdated}
              </p>
            </div>
            <a
              href={data.downloadInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 text-[14px] md:text-[16px] font-semibold rounded-[100px] transition-all duration-300 hover:-translate-y-1 ${colors.button}`}
            >
              <Image
                src="/assets/images/icons/ic_download.svg"
                alt="download icon"
                width={16}
                height={16}
                className="md:w-5 md:h-5"
              />
              <span className="hidden md:inline">Lihat Detail SOP</span>
              <span className="md:hidden">Detail SOP</span>
              <div className="w-3 h-3 md:w-4 md:h-4 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-1.5 h-1.5 md:w-2 md:h-2"
                  fill="currentColor"
                  viewBox="0 0 8 8"
                >
                  <path d="M0 0v2h2v-2h-2zm0 3v2h2v-2h-2zm3-3v2h2v-2h-2zm0 3v2h2v-2h-2zm3-3v6h2v-6h-2z" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VerticalTabs({ data }: VerticalTabsProps) {
  const [activeTab, setActiveTab] = useState<keyof SOPData>("dalam_negeri");

  const tabs = [
    {
      key: "dalam_negeri",
      title: "Dalam Negeri",
      subtitle: "Kerjasama domestik",
      icon: "/assets/images/icons/crown.svg",
    },
    {
      key: "luar_negeri",
      title: "Luar Negeri",
      subtitle: "Kerjasama internasional",
      icon: "/assets/images/icons/3d-cube-scan.svg",
    },
  ] as const;

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -20,
    },
  };

  return (
    <>
      {/* Mobile: Horizontal Tab Navigation */}
      <div className="md:hidden">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`group cursor-pointer rounded-[16px] p-4 transition-all duration-300 hover:shadow-lg whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary shadow-primary"
                  : "bg-white border-2 border-gray-200 hover:border-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-[40px] h-[40px] rounded-full transition-all duration-300 ${
                    activeTab === tab.key
                      ? "bg-white/20"
                      : "bg-gray-100 group-hover:bg-primary/20"
                  }`}
                >
                  <Image
                    src={tab.icon}
                    alt={`${tab.title} icon`}
                    width={20}
                    height={20}
                    className={activeTab === tab.key ? "brightness-0" : ""}
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <h3
                    className={`text-[16px] font-bold transition-colors duration-300 ${
                      activeTab === tab.key
                        ? "text-foreground"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {tab.title}
                  </h3>
                  <p
                    className={`text-[12px] transition-colors duration-300 ${
                      activeTab === tab.key
                        ? "text-foreground/80"
                        : "text-gray-600"
                    }`}
                  >
                    {tab.subtitle}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SOPCard data={data[activeTab]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop: Both Images Side by Side */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-8">
        <SOPCard data={data.dalam_negeri} />
        <SOPCard data={data.luar_negeri} />
      </div>
    </>
  );
}
