"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { KerjasamaData, KerjasamaType } from "@/types";

interface TabSystemProps {
  data: KerjasamaData;
}

interface DownloadCardProps {
  data: KerjasamaType;
}

const DownloadCard: React.FC<DownloadCardProps> = ({ data }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          icon: "bg-primary",
          badge: "bg-primary/20 text-foreground",
          button:
            "bg-primary hover:bg-primary/90 text-foreground hover:shadow-primary",
        };
      case "blue":
        return {
          icon: "bg-blue-100",
          badge: "bg-blue-100 text-blue-800",
          button: "bg-blue-500 hover:bg-blue-600 text-white",
        };
      case "green":
        return {
          icon: "bg-green-100",
          badge: "bg-green-100 text-green-800",
          button: "bg-green-500 hover:bg-green-600 text-white",
        };
      case "orange":
        return {
          icon: "bg-orange-100",
          badge: "bg-orange-100 text-orange-600",
          button: "bg-orange-500 hover:bg-orange-600 text-white",
        };
      default:
        return {
          icon: "bg-gray-100",
          badge: "bg-gray-100 text-gray-800",
          button: "bg-gray-500 hover:bg-gray-600 text-white",
        };
    }
  };

  const colors = getColorClasses(data?.downloadInfo?.color || "primary");

  return (
    <div className="bg-white rounded-[20px] p-6 md:p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`flex items-center justify-center w-[60px] h-[60px] rounded-full ${colors.icon}`}
        >
          <Image
            src={data?.downloadInfo?.icon || "/assets/images/icons/note-2.svg"}
            alt="document icon"
            width={24}
            height={24}
          />
        </div>
        <div className="flex-1">
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium mb-2 ${colors.badge}`}
          >
            {data?.downloadInfo?.docType || "Document"}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {data?.downloadInfo?.fileName || "Loading..."}
          </h3>
          <p className="text-[14px] text-gray-500">
            {data?.downloadInfo?.fileType || "PDF"} • {data?.downloadInfo?.fileSize || "Loading..."}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <button
          className={`inline-flex items-center justify-center gap-3 px-6 py-3 font-semibold rounded-[100px] transition-all duration-300 hover:-translate-y-1 ${colors.button}`}
        >
          <Image
            src="/assets/images/icons/ic_download.svg"
            alt="download icon"
            width={20}
            height={20}
          />
          <span className="hidden md:inline">Download File</span>
          <span className="md:hidden">Download</span>
          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
              <path d="M0 0v2h2v-2h-2zm0 3v2h2v-2h-2zm3-3v2h2v-2h-2zm0 3v2h2v-2h-2zm3-3v6h2v-6h-2z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default function TabSystem({ data }: TabSystemProps) {
  const [activeTab, setActiveTab] = useState<keyof KerjasamaData>("mou");
  const [activeSubTab, setActiveSubTab] = useState<
    "characteristics" | "examples"
  >("characteristics");

  const tabs = [
    { key: "mou", title: "MOU", icon: "/assets/images/icons/note-2.svg" },
    { key: "pks", title: "PKS", icon: "/assets/images/icons/crown.svg" },
    {
      key: "surat_kuasa",
      title: "Surat Kuasa",
      icon: "/assets/images/icons/device-message.svg",
    },
    {
      key: "nota_kesepakatan",
      title: "Nota Kesepakatan",
      icon: "/assets/images/icons/lock.svg",
    },
  ] as const;

  const activeData = data[activeTab];

  // Auto-select the first available sub tab when activeTab changes
  useEffect(() => {
    if (!activeData) return;

    const hasCharacteristics = Array.isArray(activeData.features) && activeData.features.length > 0;
    const hasExamples = Array.isArray(activeData.examples) && activeData.examples.length > 0;

    if (hasCharacteristics) {
      setActiveSubTab("characteristics");
    } else if (hasExamples) {
      setActiveSubTab("examples");
    }
  }, [activeTab, activeData]);

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  return (
    <div className="w-full">
      {/* Tab Navigation - Horizontal */}
      <div className="flex flex-col gap-8 mb-8">
        <div className="flex w-full gap-4 md:gap-[70px] border-b border-[#E7EBEA] pb-0 overflow-x-auto justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setActiveSubTab("characteristics");
              }}
              className="tab-menu group flex flex-col gap-[20px] md:gap-[30px] cursor-pointer min-w-0 flex-shrink-0 pb-6 relative"
            >
              <div className="flex gap-4 items-center justify-center md:justify-start">
                <div
                  className={`flex items-center justify-center w-[50px] h-[50px] shrink-0 rounded-full transition-all duration-300 ${
                    activeTab === tab.key
                      ? "bg-primary"
                      : "bg-tab-off group-hover:bg-primary"
                  }`}
                >
                  <div
                    className={`w-6 h-6 transition-all duration-300 ${
                      activeTab === tab.key ? "brightness-0" : "opacity-60"
                    }`}
                  >
                    <Image
                      src={tab.icon}
                      alt={`${tab.title} icon`}
                      width={24}
                      height={24}
                    />
                  </div>
                </div>
                <h3
                  className={`font-poppins text-nowrap font-semibold text-[16px] md:text-[20px] leading-[30px] transition-colors duration-300 ${
                    activeTab === tab.key
                      ? "text-foreground"
                      : "text-gray-700 group-hover:text-foreground"
                  }`}
                >
                  {tab.title}
                </h3>
              </div>

              {/* Indicator */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-all duration-300 ${
                  activeTab === tab.key ? "bg-foreground" : "bg-transparent"
                }`}
              ></div>
            </button>
          ))}
        </div>

        {/* Tab Content - Full Width */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {/* Content Layout - Side by side */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-[65px]">
              {/* Left Side - Download Card */}
              <div className="w-full lg:w-[360px] lg:shrink-0">
                <DownloadCard data={activeData} />
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 space-y-6">
                {/* Title and Description */}
                <div className="space-y-4 pb-6">
                  <h2 className="text-[24px] md:text-[32px] font-bold text-foreground leading-tight">
                    {activeData?.title || 'Loading...'}
                  </h2>
                  <p className="text-[16px] leading-7 text-gray-700">
                    {activeData?.description || 'Please wait while we load the content...'}
                  </p>
                </div>

                {/* Sub Tabs - Only show if there's data */}
                {activeData && ((Array.isArray(activeData.features) && activeData.features.length > 0) ||
                  (Array.isArray(activeData.examples) && activeData.examples.length > 0)) && (
                  <div className="border-b border-gray-200">
                    <div className="flex gap-6">
                      {Array.isArray(activeData.features) && activeData.features.length > 0 && (
                        <button
                          onClick={() => setActiveSubTab("characteristics")}
                          className={`pb-3 text-lg font-semibold transition-colors duration-300 ${
                            activeSubTab === "characteristics"
                              ? "text-foreground font-semibold border-b-2 border-primary"
                              : "text-gray-600 hover:text-primary"
                          }`}
                        >
                          Karakteristik
                        </button>
                      )}
                      {Array.isArray(activeData.examples) && activeData.examples.length > 0 && (
                        <button
                          onClick={() => setActiveSubTab("examples")}
                          className={`pb-3 text-lg font-semibold transition-colors duration-300 ${
                            activeSubTab === "examples"
                              ? "text-foreground font-semibold border-b-2 border-primary"
                              : "text-gray-600 hover:text-primary"
                          }`}
                        >
                          Contoh Implementasi
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub Tab Content - Only show if there's data */}
                {activeData && ((Array.isArray(activeData.features) && activeData.features.length > 0) ||
                  (Array.isArray(activeData.examples) && activeData.examples.length > 0)) && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSubTab}
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="py-4"
                    >
                      {activeSubTab === "characteristics" && Array.isArray(activeData.features) && activeData.features.length > 0 && (
                        <div className="space-y-4">
                          {activeData.features.map((feature, index) => (
                            <div key={index} className="flex gap-3 items-start">
                              <div className="w-3 h-3 bg-primary rounded-full mt-2 shrink-0"></div>
                              <p className="text-[16px] leading-7 text-gray-700">
                                {feature}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {activeSubTab === "examples" && Array.isArray(activeData.examples) && activeData.examples.length > 0 && (
                        <div className="space-y-4">
                          {activeData.examples.map((example, index) => (
                            <div key={index} className="flex gap-3 items-start">
                              <div className="w-3 h-3 bg-primary rounded-full mt-2 shrink-0"></div>
                              <p className="text-[16px] leading-7 text-gray-700">
                                {example}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
