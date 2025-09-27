"use client";

import React from "react";
import Image from "next/image";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useContactSettings } from "@/hooks/use-settings";
import { ContactInfo } from "@/types";

interface ContactSectionProps {
  data?: ContactInfo; // Made optional for backward compatibility
}

export default function ContactSection({ data }: ContactSectionProps) {
  const { loading, error, getSetting } = useContactSettings();

  // Fallback to data prop if available
  const contactTitle = getSetting('contact_title', data?.title || 'Hubungi Kami');
  const contactAddress = getSetting('contact_address', data?.address || 'Jl. Diponegoro No. 1, Sesayap, Tana Tidung, Kalimantan Utara');
  const contactPhone = getSetting('contact_phone', data?.phone || '+62 554 21015');
  const contactEmail = getSetting('contact_email', data?.email || 'info@tanatidungkab.go.id');
  const contactWhatsapp = getSetting('contact_whatsapp_button', data?.whatsapp || 'Hubungi WhatsApp');
  const contactWhatsappNumber = getSetting('contact_whatsapp', '+6285123456789');
  const locationName = getSetting('location_name', data?.location || 'Kantor Bupati Tana Tidung');
  const mapsEmbedUrl = getSetting('maps_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d270.2566858279373!2d116.90314051945194!3d3.6077374492850147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3216bdc4d1c72105%3A0xf83d8e6e7a25e4ce!2sKantor%20Bupati%20Kabupaten%20Tana%20Tidung!5e1!3m2!1sid!2sid!4v1758351225275!5m2!1sid!2sid');

  // WhatsApp click handler
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Halo, saya ingin menanyakan tentang layanan SIKAP.');
    const whatsappUrl = `https://wa.me/${contactWhatsappNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <AnimatedSection className="bg-foreground" animationType="fadeUp">
        <div id="contact"></div>
        <div className="mx-auto md:pl-[75px] overflow-hidden px-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  // Error state
  if (error) {
    console.error('Contact settings error:', error);
    // Fall back to default content on error
  }

  return (
    <AnimatedSection className="bg-foreground" animationType="fadeUp">
      <div id="contact"></div>
      <div className="mx-auto md:pl-[75px] overflow-hidden px-0">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-[85px] w-full">
          {/* Contact Information */}
          <div className="flex flex-col gap-[30px] flex-1">
            <div className="flex flex-col gap-2.5 text-white">
              <h2 className="text-[24px] md:text-[32px] leading-tight md:leading-[46px] font-bold">
                {contactTitle}
              </h2>

              {/* Address */}
              <div className="flex items-start gap-4 mt-4">
                <Image
                  src="/assets/images/icons/note-2.svg"
                  alt="location icon"
                  width={20}
                  height={20}
                  className="opacity-70 mt-1 shrink-0"
                />
                <span className="text-[14px] md:text-[16px] leading-relaxed">
                  {contactAddress}
                </span>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <Image
                  src="/assets/images/icons/device-message.svg"
                  alt="phone icon"
                  width={20}
                  height={20}
                  className="opacity-70 mt-1 shrink-0"
                />
                <span className="text-[14px] md:text-[16px]">{contactPhone}</span>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <Image
                  src="/assets/images/icons/lock.svg"
                  alt="email icon"
                  width={20}
                  height={20}
                  className="opacity-70 mt-1 shrink-0"
                />
                <span className="text-[14px] md:text-[16px]">{contactEmail}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button
                onClick={handleWhatsAppClick}
                className="px-[30px] py-[20px] text-[16px] font-bold leading-[19px] rounded-[100px] bg-primary transition-all duration-300 hover:shadow-primary hover:-translate-y-1"
              >
                {contactWhatsapp}
              </button>
              <div className="flex items-center gap-1.5 text-white">
                <div className="flex justify-center items-center w-[24px] h-[24px] bg-white rounded-full">
                  <div className="w-3.5 h-3.5 bg-foreground rounded-sm flex items-center justify-center">
                    <Image
                      src="/assets/images/icons/ic_check.svg"
                      alt="check icon"
                      width={12}
                      height={12}
                      className="brightness-0 invert"
                    />
                  </div>
                </div>
                <p className="text-[14px] font-bold leading-[16px]">
                  {locationName}
                </p>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="w-full lg:w-7/12 overflow-hidden">
            <div className="relative w-full h-[250px] md:h-[400px] overflow-hidden">
              <iframe
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Lokasi ${locationName}`}
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
