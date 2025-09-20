import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import contentData from '@/data/content.json';
import { ContentData } from '@/types';

const content = contentData as ContentData;

export const metadata: Metadata = {
  title: "SIKAP - Sistem Kerjasama Tana Tidung",
  description: "Sistem kerjasama berbasis digital Kabupaten Tana Tidung, yang akuntabel dan transparan",
  keywords: "kerjasama, tana tidung, sikap, pemerintah, digital, transparansi",
  authors: [{ name: "Pemerintah Kabupaten Tana Tidung" }],
  openGraph: {
    title: "SIKAP - Sistem Kerjasama Tana Tidung",
    description: "Sistem kerjasama berbasis digital Kabupaten Tana Tidung, yang akuntabel dan transparan",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <body className="antialiased">
        <Header navigation={content.navigation} />
        <main>
          {children}
        </main>
        <Footer footerData={content.footer} />
      </body>
    </html>
  );
}
