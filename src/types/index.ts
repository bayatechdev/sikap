// Re-export all types from specialized files
export * from './cooperation';
export * from './application';
export * from './api';

// Legacy frontend types (keeping for backward compatibility)
export interface SOPDownloadInfo {
  fileName: string;
  fileSize: string;
  fileType: string;
  lastUpdated: string;
  url: string;
}

export interface SOPType {
  title: string;
  category: string;
  description: string;
  image: string;
  features: string[];
  downloadInfo: SOPDownloadInfo;
  color: string;
}

export interface SOPData {
  dalam_negeri: SOPType;
  luar_negeri: SOPType;
}

export interface StatItem {
  number: string;
  label: string;
  description: string;
}

export interface CTAButtons {
  primary: string;
  secondary: string;
}

export interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
  cta: CTAButtons;
  stats: StatItem[];
}

export interface ContactInfo {
  title: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  location: string;
}

export interface DownloadSection {
  title: string;
  subtitle: string;
  helpSection: {
    title: string;
    description: string;
    cta: CTAButtons;
  };
}

export interface FooterSection {
  title: string;
  links: string[];
}

export interface FooterData {
  copyright: string;
  sections: {
    product: FooterSection;
    company: FooterSection;
    developer: FooterSection;
  };
}

export interface NavigationData {
  home: string;
  about: string;
  cooperation: string;
  sop: string;
  download: string;
  contact: string;
}

export interface SiteInfo {
  title: string;
  fullName: string;
  description: string;
}

export interface DasarHukumItem {
  id: number;
  title: string;
  year: string;
  pdfUrl: string;
  fileSize?: string;
}

export interface DasarHukumCategory {
  id: string;
  name: string;
  icon: string;
  items: DasarHukumItem[];
}

export interface DasarHukumData {
  categories: DasarHukumCategory[];
}

export interface ContentData {
  site: SiteInfo;
  hero: HeroSection;
  navigation: NavigationData;
  contact: ContactInfo;
  download: DownloadSection;
  footer: FooterData;
}