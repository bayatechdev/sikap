"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSlide } from "@/hooks/use-settings";

interface HeroCarouselProps {
  slides: HeroSlide[];
  globalTitle: string;
  globalSubtitle: string;
  primaryButton: string;
  secondaryButton: string;
  autoPlayInterval?: number;
}

// Split Layout Slide Content - 1 Image Only
interface SplitSlideContentProps {
  title: string;
  subtitle: string;
  primaryButton: string;
  secondaryButton: string;
  imageUrl: string;
  imageAlt: string;
}

function SplitSlideContent({ title, subtitle, primaryButton, secondaryButton, imageUrl, imageAlt }: SplitSlideContentProps) {
  const leftVariants = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-section">
      <div className="max-w-[1280px] w-full px-4 md:px-[75px]">
        <div className="flex flex-col lg:flex-row gap-[30px] items-center">
          {/* Left Content */}
          <motion.div
            className="flex flex-col gap-[30px] w-full lg:w-[550px] shrink-0 py-8 lg:py-[92px]"
            variants={leftVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <h1 className="text-[32px] md:text-6xl font-extrabold leading-tight md:leading-[70px]">
              {title.replace('SIKAP', '')}{" "}
              <span className="bg-primary inline-flex -mx-1 items-center justify-center px-3 py-2 md:h-14 rounded">
                SIKAP
              </span>
            </h1>
            <p className="max-w-[484px] text-lg leading-8 font-medium text-gray-700">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5">
              <button className="px-[30px] py-[20px] rounded-[100px] bg-primary text-[16px] font-bold leading-[19px] transition-all duration-300 hover:shadow-primary hover:-translate-y-1">
                {primaryButton}
              </button>
              <button className="px-[30px] py-[20px] rounded-[100px] border border-foreground text-[16px] font-bold leading-[19px] transition-all duration-300 hover:ring-2 hover:ring-primary hover:bg-primary hover:border-primary hover:text-foreground">
                {secondaryButton}
              </button>
            </div>
          </motion.div>

          {/* Right Content - Single Static Image */}
          <motion.div
            className="relative shrink-0 w-full lg:w-[550px] h-[400px] lg:h-[507px]"
            variants={rightVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Main Image with rounded corners */}
            <div className="absolute bg-primary h-full w-[calc(100%-32px)] lg:w-[487px] pt-5 rounded-[26px] overflow-hidden">
              <div className="absolute bg-accent h-full w-[calc(100%-52px)] lg:w-[487px] pt-5 rounded-[22px] overflow-hidden ml-4">
                <div className="absolute ml-3 mr-3 lg:ml-[18px] lg:mr-[33px] w-[calc(100%-32px)] lg:w-[467px] h-full lg:h-[506px] rounded-tl-[18px] overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    priority
                    />
                </div>
              </div>
            </div>

            {/* Review Card */}
            {/* <div className="absolute bottom-[20px] lg:bottom-[68px] left-0 w-[200px] lg:w-[316px] h-auto z-10">
              <Image
                src="/assets/images/thumbnails/review.png"
                alt="Review"
                width={316}
                height={150}
                className="drop-shadow-custom w-auto h-auto"
              />
            </div> */}

            {/* Badge Card */}
            <div className="absolute top-[20px] lg:top-[77px] right-0 w-[80px] lg:w-[136px] h-auto z-10">
              <Image
                src="/assets/images/thumbnails/hero_logo.png"
                alt="Badge"
                width={136}
                height={120}
                className="drop-shadow-custom w-auto h-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Full Slider Layout Slide Content - 1 Image Only
interface FullSlideContentProps {
  title: string;
  subtitle: string;
  primaryButton: string;
  secondaryButton: string;
  imageUrl: string;
  imageAlt: string;
}

function FullSlideContent({ title, subtitle, primaryButton, secondaryButton, imageUrl, imageAlt }: FullSlideContentProps) {
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

  return (
    <div className="relative w-full h-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
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
    </div>
  );
}

// Main HeroCarousel Component
export default function HeroCarousel({
  slides,
  globalTitle,
  globalSubtitle,
  primaryButton,
  secondaryButton,
  autoPlayInterval = 6000,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  }, [slides.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, slides.length, autoPlayInterval, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToNext, goToPrevious]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (!slides || slides.length === 0) {
    return (
      <header className="bg-section w-full h-screen flex items-center justify-center">
        <p className="text-gray-500">No hero slides available</p>
      </header>
    );
  }

  const currentSlide = slides[currentIndex];
  const slideTitle = currentSlide.title || globalTitle;
  const slideSubtitle = currentSlide.subtitle || globalSubtitle;

  // Get first image from imagesJson array (now only 1 image per slide)
  const slideImage = currentSlide.imagesJson && currentSlide.imagesJson[0]
    ? {
        url: currentSlide.imagesJson[0].url,
        alt: currentSlide.imagesJson[0].alt || slideTitle
      }
    : null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // If no image found, show error state
  if (!slideImage || !slideImage.url) {
    return (
      <header className="bg-section w-full h-screen flex items-center justify-center">
        <p className="text-gray-500">No image available for current slide</p>
      </header>
    );
  }

  return (
    <header
      id="home"
      className="relative w-full h-screen overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides Container */}
      <div className="relative h-full">
        <AnimatePresence initial={false} custom={currentIndex} mode="wait">
          <motion.div
            key={currentIndex}
            custom={currentIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 }
            }}
            className="absolute inset-0"
          >
            {currentSlide.version === 'split' ? (
              <SplitSlideContent
                title={slideTitle}
                subtitle={slideSubtitle}
                primaryButton={primaryButton}
                secondaryButton={secondaryButton}
                imageUrl={slideImage.url}
                imageAlt={slideImage.alt}
              />
            ) : (
              <FullSlideContent
                title={slideTitle}
                subtitle={slideSubtitle}
                primaryButton={primaryButton}
                secondaryButton={secondaryButton}
                imageUrl={slideImage.url}
                imageAlt={slideImage.alt}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
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
      {!isPaused && slides.length > 1 && (
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
