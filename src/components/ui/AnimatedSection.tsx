'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scale';
  delay?: number;
}

const animationVariants = {
  fadeUp: {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  },
  fadeLeft: {
    hidden: {
      opacity: 0,
      x: -60,
    },
    visible: {
      opacity: 1,
      x: 0,
    },
  },
  fadeRight: {
    hidden: {
      opacity: 0,
      x: 60,
    },
    visible: {
      opacity: 1,
      x: 0,
    },
  },
  scale: {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
    },
  },
};

export default function AnimatedSection({
  children,
  className = '',
  animationType = 'fadeUp',
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px',
    triggerOnce: true,
  });

  const variants = animationVariants[animationType];

  return (
    <motion.section
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isIntersecting ? 'visible' : 'hidden'}
      transition={{ duration: 0.8, ease: "easeInOut", delay }}
    >
      {children}
    </motion.section>
  );
}