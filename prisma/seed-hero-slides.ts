import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const heroSlides = [
  {
    version: 'split',
    order: 1,
    isActive: true,
    title: null, // Use global setting
    subtitle: null, // Use global setting
    imagesJson: [
      {
        url: '/assets/images/thumbnails/ui.png',
        alt: 'SIKAP Interface - Tampilan Utama'
      }
    ]
  },
  {
    version: 'full',
    order: 2,
    isActive: true,
    title: null, // Use global setting
    subtitle: null, // Use global setting
    imagesJson: [
      {
        url: '/assets/images/hero/kegiatan-kerjasama.jpg',
        alt: 'Kegiatan Kerjasama Daerah'
      }
    ]
  },
  {
    version: 'full',
    order: 3,
    isActive: false,
    title: 'Platform Digital Terpercaya',
    subtitle: 'Menghubungkan pemerintah dengan mitra strategis untuk pembangunan daerah',
    imagesJson: [
      {
        url: '/assets/images/hero/kantor-bupati.jpg',
        alt: 'Kantor Bupati Tana Tidung'
      }
    ]
  }
];

async function seedHeroSlides() {
  console.log('🌱 Seeding hero slides...');

  for (const slide of heroSlides) {
    try {
      const existingSlide = await prisma.heroSlide.findFirst({
        where: {
          version: slide.version,
          order: slide.order,
        },
      });

      if (existingSlide) {
        await prisma.heroSlide.update({
          where: { id: existingSlide.id },
          data: slide,
        });
        console.log(`✅ Hero slide "${slide.version}" (order ${slide.order}) updated`);
      } else {
        await prisma.heroSlide.create({
          data: slide,
        });
        console.log(`✅ Hero slide "${slide.version}" (order ${slide.order}) created`);
      }
    } catch (error) {
      console.error(`❌ Error seeding hero slide "${slide.version}" (order ${slide.order}):`, error);
    }
  }
}

async function main() {
  try {
    await seedHeroSlides();
    console.log('🎉 Hero slides seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding hero slides:', error);
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

export { seedHeroSlides };
