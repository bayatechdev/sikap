import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import AuthProvider from "@/components/providers/session-provider";

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
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
