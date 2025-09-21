import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import contentData from '@/data/content.json';
import { ContentData } from '@/types';

const content = contentData as ContentData;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header navigation={content.navigation} />
      <main>
        {children}
      </main>
      <Footer footerData={content.footer} />
    </>
  );
}