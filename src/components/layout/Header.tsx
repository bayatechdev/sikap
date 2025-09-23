"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { NavigationData } from "@/types";

interface HeaderProps {
  navigation: NavigationData;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Header({ navigation }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;
      const hideThreshold = 100;
      const showThreshold = 35;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Only update if scroll difference is significant
      if (scrollDifference < 10) {
        ticking = false;
        return;
      }

      // Only apply hide/show behavior after scrolling past threshold
      if (currentScrollY > hideThreshold) {
        if (currentScrollY > lastScrollY && isVisible) {
          // Scrolling down - hide navbar
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY && !isVisible) {
          // Scrolling up - show navbar
          const upwardScrollDistance = lastScrollY - currentScrollY;
          if (upwardScrollDistance > showThreshold) {
            setIsVisible(true);
          }
        }
      } else {
        // At top of page - always show navbar
        if (!isVisible) {
          setIsVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    };

    window.addEventListener("scroll", requestTick, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestTick);
    };
  }, [lastScrollY, isVisible]);

  const navbarVariants = {
    visible: {
      y: 0,
    },
    hidden: {
      y: -100,
    },
  };

  return (
    <motion.header
      className="fixed top-[30px] left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[1160px] mx-auto px-4"
      variants={navbarVariants}
      animate={isVisible ? "visible" : "hidden"}
      initial="visible"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <nav className="flex items-center gap-[30px] w-full overflow-hidden bg-foreground rounded-[100px] py-2.5 px-[30px]">
        {/* Logo */}
        <div className="shrink-0">
          <Image
            src="/assets/images/icons/sikap.svg"
            alt="SIKAP Logo"
            width={120}
            height={40}
            className="h-auto w-auto"
          />
        </div>

        {/* Separator */}
        <div className="bg-[#6C8079] w-[1px] h-[50px] hidden md:block"></div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-10 flex-1">
          <Link
            href="/"
            className="hover:text-primary hover:underline text-white text-[16px] font-semibold transition-all duration-300"
          >
            Beranda
          </Link>
          <a
            href="#about"
            className="hover:text-primary hover:underline text-white text-[16px] font-semibold transition-all duration-300"
          >
            Dasar Hukum
          </a>
          <a
            href="/permohonan"
            className="hover:text-primary hover:underline text-white text-[16px] font-semibold transition-all duration-300"
          >
            Permohonan
          </a>
          <Link
            href="/track"
            className="hover:text-primary hover:underline text-white text-[16px] font-semibold transition-all duration-300"
          >
            Lacak Status
          </Link>
          <a
            href="/kerjasama"
            className="hover:text-primary hover:underline text-white text-[16px] font-semibold transition-all duration-300"
          >
            Data
          </a>
          <a
            href="#download"
            className="hover:text-primary hover:underline text-white text-[16px] font-semibold transition-all duration-300"
          >
            Download
          </a>
        </div>

        {/* CTA Button */}
        <div className="ml-auto flex items-center gap-3.5">
          <button className="border border-white text-white text-[16px] font-semibold px-5 h-[43px] flex items-center rounded-[100px] transition-all duration-300 hover:ring-2 hover:ring-primary hover:bg-primary hover:border-primary hover:text-foreground">
            Hubungi Kami
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden ml-auto">
          <button className="text-white hover:text-primary transition-colors duration-300">
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
