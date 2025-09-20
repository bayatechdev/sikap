"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { DasarHukumData, DasarHukumCategory } from "@/types";

interface DasarHukumSectionProps {
  data: DasarHukumData;
}

interface AccordionItemProps {
  category: DasarHukumCategory;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  category,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="bg-white rounded-[16px] md:rounded-[20px] shadow-lg border border-gray-200 overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center justify-center w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full bg-primary/10">
            <Image
              src={category.icon}
              alt={`${category.name} icon`}
              width={20}
              height={20}
              className="md:w-6 md:h-6"
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <h3 className="text-[16px] md:text-[18px] font-bold text-foreground">
              {category.name}
            </h3>
            <p className="text-[12px] md:text-[14px] text-gray-600">
              {category.items.length} dokumen
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-200"
          >
            <div className="p-4 md:p-6 pt-0 mt-4 md:mt-6">
              <div className="space-y-3 md:space-y-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-[12px] hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-full bg-red-100">
                        <Image
                          src="/assets/images/icons/ic_download.svg"
                          alt="PDF icon"
                          width={16}
                          height={16}
                          className="md:w-5 md:h-5"
                        />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <h4 className="text-[14px] md:text-[16px] font-semibold text-foreground line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] md:text-[12px] text-gray-600">
                          <span>PDF</span>
                          <span>•</span>
                          <span>{item.year}</span>
                          {item.fileSize && (
                            <>
                              <span>•</span>
                              <span>{item.fileSize}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary hover:bg-primary/90 text-foreground text-[12px] md:text-[14px] font-semibold rounded-[100px] transition-all duration-300 hover:shadow-primary whitespace-nowrap"
                    >
                      <span className="hidden md:inline">Lihat PDF</span>
                      <span className="md:hidden">PDF</span>
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function DasarHukumSection({ data }: DasarHukumSectionProps) {
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(
    new Set([data.categories[0]?.id]) // Default pertama terbuka
  );

  const toggleAccordion = (categoryId: string) => {
    setOpenAccordions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <AnimatedSection className="py-[60px] md:py-[100px]" animationType="fadeUp">
      <div id="dasar-hukum"></div>
      <div className="mx-auto px-4 md:px-[75px] max-w-[1280px]">
        <div className="flex flex-col lg:flex-row gap-[30px] lg:gap-[50px]">
          {/* Left Side - Title and Image */}
          <div className="w-full lg:w-[400px] lg:shrink-0">
            <div className="flex flex-col gap-6 lg:gap-8 lg:sticky lg:top-8">
              {/* Section Header */}
              <div className="flex flex-col gap-3 text-center lg:text-left">
                <h2 className="text-[32px] md:text-[40px] lg:text-[50px] font-bold leading-tight text-foreground">
                  Dasar Hukum
                </h2>
                <p className="text-base md:text-lg leading-relaxed font-medium text-gray-700">
                  Referensi lengkap peraturan dan undang-undang yang menjadi
                  dasar pelaksanaan kerjasama
                </p>
              </div>

              {/* Illustration/Image */}
              <div className="relative w-full aspect-square bg-gradient-to-br from-primary/10 to-foreground/5 rounded-[20px] flex items-center justify-center border border-primary/20">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Image
                      src="/assets/images/icons/crown.svg"
                      alt="legal icon"
                      width={32}
                      height={32}
                      className="md:w-10 md:h-10"
                    />
                  </div>
                  <h3 className="text-foreground font-bold text-lg md:text-xl mb-2">
                    Landasan Legal
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base max-w-[200px] mx-auto">
                    Dokumen hukum yang mengatur kerjasama daerah
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Accordion Content */}
          <div className="flex-1">
            <div className="flex flex-col gap-4 md:gap-6">
              {data.categories.map((category) => (
                <AccordionItem
                  key={category.id}
                  category={category}
                  isOpen={openAccordions.has(category.id)}
                  onToggle={() => toggleAccordion(category.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-6 bg-section rounded-[16px] md:rounded-[20px] p-6 md:p-8 mt-[30px] md:mt-[50px]">
          <div className="text-center">
            <h3 className="text-[20px] md:text-[28px] font-bold text-foreground mb-3">
              Butuh Bantuan Interpretasi Hukum?
            </h3>
            <p className="text-[14px] md:text-[16px] text-gray-700 max-w-[600px]">
              Tim legal kami siap membantu memberikan penjelasan dan konsultasi
              terkait dasar hukum kerjasama
            </p>
          </div>
          <a
            href="#contact"
            className="px-[24px] md:px-[30px] py-[12px] md:py-[16px] bg-primary hover:bg-primary/90 text-foreground font-bold rounded-[100px] transition-all duration-300 hover:shadow-primary text-[14px] md:text-[16px]"
          >
            Konsultasi Legal
          </a>
        </div>
      </div>
    </AnimatedSection>
  );
}
