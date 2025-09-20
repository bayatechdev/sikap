import DasarHukumSection from "@/components/sections/DasarHukumSection";
import { dasarHukumData } from "@/data/dasarHukumData";

export default function TestDasarHukumPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <DasarHukumSection data={dasarHukumData} />
    </main>
  );
}