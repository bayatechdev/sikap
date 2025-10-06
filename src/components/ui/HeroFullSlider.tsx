"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HeroImage } from "@/components/ui/HeroImageManager";

interface HeroFullSliderProps {
  images: HeroImage[];
  autoPlayInterval?: number;
  title: string;
  subtitle: string;
  primaryButton: string;
  secondaryButton: string;
}

export default function HeroFullSlider({
  images,
  autoPlayInterval = 6000,
  title,
  subtitle,
  primaryButton,
  secondaryButton,
}: HeroFullSliderProps) {
  const safeImages = Array.isArray(images) ? images : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === safeImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [safeImages.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? safeImages.length - 1 : prevIndex - 1
    );
  }, [safeImages.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPaused || safeImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === safeImages.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, safeImages.length, autoPlayInterval]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const slideVariants = {
    enter: {
      opacity: 0,
      scale: 1.1,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  if (!safeImages || safeImages.length === 0) {
    return (
      <header id="home" className="relative w-full h-screen bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No images to display</p>
      </header>
    );
  }

  return (
    <header
      id="home"
      className="relative w-full h-screen overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 1.2,
              ease: "easeInOut",
            }}
            className="absolute inset-0"
          >
            <Image
              src={safeImages[currentIndex].url}
              alt={safeImages[currentIndex].alt}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="max-w-[1280px] w-full px-4 md:px-[75px]">
          <motion.div
            className="flex flex-col items-center text-center gap-8"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-white max-w-4xl">
              {title.replace('SIKAP', '')}{" "}
              <span className="bg-primary inline-flex -mx-1 items-center justify-center px-3 py-2 md:px-5 md:py-3 rounded text-foreground">
                SIKAP
              </span>
            </h1>
            <p className="max-w-2xl text-lg md:text-xl leading-relaxed font-medium text-white/90">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button className="px-8 py-4 rounded-full bg-primary text-foreground text-base font-bold transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:-translate-y-1">
                {primaryButton}
              </button>
              <button className="px-8 py-4 rounded-full border-2 border-white text-white text-base font-bold transition-all duration-300 hover:bg-white hover:text-foreground">
                {secondaryButton}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {safeImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {safeImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {safeImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-12 h-3 bg-primary"
                  : "w-3 h-3 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {!isPaused && safeImages.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
            key={`${currentIndex}-${isPaused}`}
          />
        </div>
      )}
    </header>
  );
}
