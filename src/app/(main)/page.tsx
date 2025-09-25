import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import KerjasamaSection from "@/components/sections/KerjasamaSection";
import SOPSection from "@/components/sections/SOPSection";
import DasarHukumSection from "@/components/sections/DasarHukumSection";
import ContactSection from "@/components/sections/ContactSection";

// Import data
import contentData from "@/data/content.json";
import kerjasamaData from "@/data/kerjasama.json";
import sopData from "@/data/sop.json";
// import { dasarHukumData } from "@/data/dasarHukumData"; // Now using API

// Type the imported data
import { ContentData, KerjasamaData, SOPData } from "@/types";

const content = contentData as ContentData;
const kerjasama = kerjasamaData as KerjasamaData;
const sop = sopData as SOPData;

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection data={content.hero} />
      <StatsSection />
      <TestimonialSection />
      <KerjasamaSection data={kerjasama} />
      <DasarHukumSection />
      <SOPSection data={sop} />
      {/* <DownloadSection /> */}
      <ContactSection data={content.contact} />
    </div>
  );
}
