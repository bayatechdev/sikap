"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface HeroImage {
  url: string;
  alt: string;
  title?: string;
}

interface HeroSliderProps {
  images: HeroImage[];
  autoPlayInterval?: number; // milliseconds
  className?: string;
}

export default function HeroSlider({
  images,
  autoPlayInterval = 5000,
  className = ""
}: HeroSliderProps) {
  // Ensure images is always an array
  const safeImages = Array.isArray(images) ? images : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
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

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(!isAutoPlaying);
  }, [isAutoPlaying]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused || safeImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === safeImages.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, isPaused, safeImages.length, autoPlayInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToNext, goToPrevious, toggleAutoPlay]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (!safeImages || safeImages.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No images to display</p>
      </div>
    );
  }

  // If only one image, don't show controls
  if (safeImages.length === 1) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={safeImages[0].url}
          alt={safeImages[0].alt}
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div
      className={`relative overflow-hidden group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main slider */}
      <div className="relative h-full">
        <AnimatePresence initial={false} custom={currentIndex}>
          <motion.div
            key={currentIndex}
            custom={currentIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                goToNext();
              } else if (swipe > swipeConfidenceThreshold) {
                goToPrevious();
              }
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
          </motion.div>
        </AnimatePresence>
      </div>



      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
        {safeImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? 'bg-white scale-110'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {isAutoPlaying && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            className="h-full bg-white"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
            key={`${currentIndex}-${isAutoPlaying}-${isPaused}`}
          />
        </div>
      )}
    </div>
  );
}