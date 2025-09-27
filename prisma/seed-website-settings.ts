import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const websiteSettings = [
  // Site Information
  {
    key: 'site_title',
    value: 'SIKAP - Sistem Informasi Kerjasama Kabupaten Tana Tidung',
    description: 'Main title of the website',
    type: 'text',
  },
  {
    key: 'site_subtitle',
    value: 'Sistem kerjasama berbasis digital yang akuntabel dan transparan',
    description: 'Subtitle description for the website',
    type: 'text',
  },
  {
    key: 'site_description',
    value: 'Platform digital resmi Pemerintah Kabupaten Tana Tidung untuk mengelola kerjasama dengan berbagai institusi, baik dalam negeri maupun luar negeri, secara transparan dan akuntabel.',
    description: 'Meta description for SEO',
    type: 'textarea',
  },

  // Hero Section
  {
    key: 'hero_title',
    value: 'Selamat datang di Website SIKAP',
    description: 'Main hero title',
    type: 'text',
  },
  {
    key: 'hero_subtitle',
    value: 'Sistem kerjasama berbasis digital Kabupaten Tana Tidung yang akuntabel dan transparan',
    description: 'Hero subtitle',
    type: 'text',
  },
  {
    key: 'hero_primary_button',
    value: 'Ajukan Kerjasama',
    description: 'Primary CTA button text',
    type: 'text',
  },
  {
    key: 'hero_secondary_button',
    value: 'Lihat Data',
    description: 'Secondary CTA button text',
    type: 'text',
  },
  {
    key: 'hero_images',
    value: JSON.stringify([
      {
        url: '/assets/images/thumbnails/ui.png',
        alt: 'SIKAP Interface - Tampilan Utama',
        title: 'Dashboard SIKAP'
      },
      {
        url: '/assets/images/hero/kantor-bupati.jpg',
        alt: 'Kantor Bupati Tana Tidung',
        title: 'Kantor Bupati'
      },
      {
        url: '/assets/images/hero/kegiatan-kerjasama.jpg',
        alt: 'Kegiatan Kerjasama Daerah',
        title: 'Kerjasama Daerah'
      }
    ]),
    description: 'Array of hero images for slider',
    type: 'json',
  },

  // Welcome/Greeting Section
  {
    key: 'welcome_enabled',
    value: 'true',
    description: 'Enable/disable welcome section',
    type: 'boolean',
  },
  {
    key: 'welcome_title',
    value: 'Sambutan Bupati Tana Tidung',
    description: 'Welcome section title',
    type: 'text',
  },
  {
    key: 'welcome_person_name',
    value: 'Drs. H. Uran, M.Si',
    description: 'Name of the person giving welcome message',
    type: 'text',
  },
  {
    key: 'welcome_person_title',
    value: 'Bupati Kabupaten Tana Tidung',
    description: 'Title/position of the person',
    type: 'text',
  },
  {
    key: 'welcome_message',
    value: 'Selamat datang di SIKAP, platform digital yang kami hadirkan untuk mempermudah proses kerjasama dengan berbagai pihak. Melalui sistem ini, kami berkomitmen untuk menciptakan transparansi dan akuntabilitas dalam setiap bentuk kerjasama yang dilakukan Pemerintah Kabupaten Tana Tidung. Mari bersama-sama membangun Tana Tidung yang lebih maju melalui kerjasama yang berkelanjutan.',
    description: 'Welcome message content',
    type: 'textarea',
  },
  {
    key: 'welcome_photo',
    value: '/assets/images/officials/bupati-tana-tidung.jpg',
    description: 'Photo of the person giving welcome message',
    type: 'image',
  },

  // Contact Information
  {
    key: 'contact_title',
    value: 'Hubungi Kami',
    description: 'Contact section title',
    type: 'text',
  },
  {
    key: 'contact_address',
    value: 'Jl. Mulawarman No. 1, Tarakan, Kalimantan Utara, Indonesia 77115',
    description: 'Office address',
    type: 'textarea',
  },
  {
    key: 'contact_phone',
    value: '+62 551 21345',
    description: 'Office phone number',
    type: 'text',
  },
  {
    key: 'contact_email',
    value: 'pemkab@tanatidungkab.go.id',
    description: 'Official email address',
    type: 'email',
  },
  {
    key: 'contact_whatsapp',
    value: '+62 812 3456 7890',
    description: 'WhatsApp number for contact',
    type: 'text',
  },
  {
    key: 'contact_whatsapp_button',
    value: 'Hubungi via WhatsApp',
    description: 'WhatsApp button text',
    type: 'text',
  },

  // Location Information
  {
    key: 'location_name',
    value: 'Kantor Bupati Kabupaten Tana Tidung',
    description: 'Location name',
    type: 'text',
  },
  {
    key: 'location_coordinates',
    value: JSON.stringify({
      latitude: 3.6077374492850147,
      longitude: 116.90314051945194
    }),
    description: 'GPS coordinates for maps',
    type: 'json',
  },
  {
    key: 'maps_embed_url',
    value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d270.2566858279373!2d116.90314051945194!3d3.6077374492850147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3216bdc4d1c72105%3A0xf83d8e6e7a25e4ce!2sKantor%20Bupati%20Kabupaten%20Tana%20Tidung!5e1!3m2!1sid!2sid!4v1758351225275!5m2!1sid!2sid',
    description: 'Google Maps embed URL',
    type: 'url',
  },

  // Social Media
  {
    key: 'social_facebook',
    value: 'https://facebook.com/pemkabtanatidung',
    description: 'Facebook page URL',
    type: 'url',
  },
  {
    key: 'social_instagram',
    value: 'https://instagram.com/pemkabtanatidung',
    description: 'Instagram page URL',
    type: 'url',
  },
  {
    key: 'social_twitter',
    value: 'https://twitter.com/pemkabtanatidung',
    description: 'Twitter page URL',
    type: 'url',
  },
  {
    key: 'social_youtube',
    value: 'https://youtube.com/@pemkabtanatidung',
    description: 'YouTube channel URL',
    type: 'url',
  },

  // Partners Section
  {
    key: 'partners_title',
    value: 'Partner Kami',
    description: 'Partners section title',
    type: 'text',
  },
  {
    key: 'partners_enabled',
    value: 'true',
    description: 'Enable/disable partners section',
    type: 'boolean',
  },

  // Statistics
  {
    key: 'stats_total_cooperations',
    value: '150+',
    description: 'Total cooperations stat',
    type: 'text',
  },
  {
    key: 'stats_active_partners',
    value: '85+',
    description: 'Active partners stat',
    type: 'text',
  },
  {
    key: 'stats_documents_processed',
    value: '500+',
    description: 'Documents processed stat',
    type: 'text',
  },
  {
    key: 'stats_success_rate',
    value: '95%',
    description: 'Success rate stat',
    type: 'text',
  },

  // Theme & Branding
  {
    key: 'primary_color',
    value: '#10B981',
    description: 'Primary brand color',
    type: 'color',
  },
  {
    key: 'secondary_color',
    value: '#1F2937',
    description: 'Secondary brand color',
    type: 'color',
  },
  {
    key: 'logo_url',
    value: '/assets/images/logo/sikap-logo.png',
    description: 'Main logo URL',
    type: 'image',
  },
  {
    key: 'favicon_url',
    value: '/favicon.ico',
    description: 'Favicon URL',
    type: 'image',
  },

  // SEO & Meta
  {
    key: 'meta_keywords',
    value: 'SIKAP, Tana Tidung, Kerjasama, Pemerintah Daerah, Kalimantan Utara, MOU, PKS',
    description: 'SEO keywords',
    type: 'text',
  },
  {
    key: 'meta_author',
    value: 'Pemerintah Kabupaten Tana Tidung',
    description: 'Meta author',
    type: 'text',
  },
  {
    key: 'og_image',
    value: '/assets/images/og/sikap-og-image.png',
    description: 'Open Graph image for social sharing',
    type: 'image',
  }
];

async function seedWebsiteSettings() {
  console.log('🌱 Seeding website settings...');

  for (const setting of websiteSettings) {
    try {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          description: setting.description,
          type: setting.type,
        },
        create: setting,
      });
      console.log(`✅ Setting "${setting.key}" seeded`);
    } catch (error) {
      console.error(`❌ Error seeding setting "${setting.key}":`, error);
    }
  }
}

async function main() {
  try {
    await seedWebsiteSettings();
    console.log('🎉 Website settings seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding website settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedWebsiteSettings };