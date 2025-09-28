import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Import the existing sop.json data
const sopDataPath = path.join(process.cwd(), 'src', 'data', 'sop.json');
const sopData = JSON.parse(fs.readFileSync(sopDataPath, 'utf8'));

async function main() {
  console.log('🔄 Starting SOP documents seeding...');

  // Clear existing SOP documents first
  await prisma.sOPDocument.deleteMany({});
  console.log('🗑️  Cleared existing SOP documents');

  const sopDocuments = [
    // Core SOP documents from JSON
    {
      title: sopData.dalam_negeri.title,
      category: sopData.dalam_negeri.category,
      description: sopData.dalam_negeri.description,
      imagePath: sopData.dalam_negeri.image,
      features: JSON.stringify(sopData.dalam_negeri.features),
      downloadInfo: JSON.stringify(sopData.dalam_negeri.downloadInfo),
      color: sopData.dalam_negeri.color,
      displayOrder: 1,
      active: true
    },
    {
      title: sopData.luar_negeri.title,
      category: sopData.luar_negeri.category,
      description: sopData.luar_negeri.description,
      imagePath: sopData.luar_negeri.image,
      features: JSON.stringify(sopData.luar_negeri.features),
      downloadInfo: JSON.stringify(sopData.luar_negeri.downloadInfo),
      color: sopData.luar_negeri.color,
      displayOrder: 2,
      active: true
    },
    // Additional comprehensive SOP documents
    {
      title: 'SOP Kerjasama Bidang Ekonomi dan Perdagangan',
      category: 'Ekonomi & Perdagangan',
      description: 'Prosedur khusus untuk kerjasama di bidang ekonomi, perdagangan, dan investasi. Mencakup pengembangan UMKM, promosi produk lokal, dan pembukaan pasar baru.',
      imagePath: '/assets/images/sop-ekonomi.png',
      features: JSON.stringify([
        'Analisis ekonomi dan kelayakan',
        'Kajian dampak terhadap UMKM lokal',
        'Koordinasi dengan Dinas Perdagangan',
        'Monitoring indikator ekonomi',
        'Evaluasi benefit-cost ratio'
      ]),
      downloadInfo: JSON.stringify({
        fileName: 'SOP-Ekonomi-Perdagangan.pdf',
        fileSize: '2.8 MB',
        fileType: 'PDF',
        lastUpdated: '10 Januari 2025',
        url: '#'
      }),
      color: 'green',
      displayOrder: 3,
      active: true
    },
    {
      title: 'SOP Kerjasama Bidang Pendidikan dan Pelatihan',
      category: 'Pendidikan & SDM',
      description: 'Panduan untuk kerjasama dalam pengembangan sumber daya manusia, pendidikan, pelatihan, dan capacity building bagi aparatur dan masyarakat Tana Tidung.',
      imagePath: '/assets/images/sop-pendidikan.png',
      features: JSON.stringify([
        'Program beasiswa dan pertukaran',
        'Pelatihan teknis dan manajerial',
        'Sertifikasi kompetensi',
        'Pengembangan kurikulum lokal',
        'Transfer knowledge dan teknologi'
      ]),
      downloadInfo: JSON.stringify({
        fileName: 'SOP-Pendidikan-Pelatihan.pdf',
        fileSize: '2.5 MB',
        fileType: 'PDF',
        lastUpdated: '5 Januari 2025',
        url: '#'
      }),
      color: 'orange',
      displayOrder: 4,
      active: true
    },
    {
      title: 'SOP Kerjasama Bidang Kesehatan dan Sosial',
      category: 'Kesehatan & Sosial',
      description: 'Prosedur untuk kerjasama dalam peningkatan pelayanan kesehatan masyarakat, program sosial, dan pemberdayaan komunitas khususnya di daerah terpencil.',
      imagePath: '/assets/images/sop-kesehatan.png',
      features: JSON.stringify([
        'Program kesehatan masyarakat',
        'Telemedicine dan rujukan medis',
        'Bantuan sosial dan pemberdayaan',
        'Pelatihan tenaga kesehatan',
        'Monitoring indikator kesehatan'
      ]),
      downloadInfo: JSON.stringify({
        fileName: 'SOP-Kesehatan-Sosial.pdf',
        fileSize: '2.3 MB',
        fileType: 'PDF',
        lastUpdated: '12 Januari 2025',
        url: '#'
      }),
      color: 'red',
      displayOrder: 5,
      active: true
    },
    {
      title: 'SOP Kerjasama Bidang Infrastruktur dan Pembangunan',
      category: 'Infrastruktur & Pembangunan',
      description: 'Pedoman untuk kerjasama pembangunan infrastruktur, termasuk jalan, jembatan, fasilitas umum, dan infrastruktur digital di Kabupaten Tana Tidung.',
      imagePath: '/assets/images/sop-infrastruktur.png',
      features: JSON.stringify([
        'Perencanaan dan desain infrastruktur',
        'Koordinasi dengan PUPR',
        'Environmental impact assessment',
        'Quality control dan supervisi',
        'Maintenance dan sustainability'
      ]),
      downloadInfo: JSON.stringify({
        fileName: 'SOP-Infrastruktur-Pembangunan.pdf',
        fileSize: '3.5 MB',
        fileType: 'PDF',
        lastUpdated: '18 Januari 2025',
        url: '#'
      }),
      color: 'purple',
      displayOrder: 6,
      active: true
    },
    {
      title: 'SOP Kerjasama Bidang Lingkungan dan Konservasi',
      category: 'Lingkungan & Konservasi',
      description: 'Prosedur untuk kerjasama dalam pelestarian lingkungan, konservasi alam, pengelolaan sampah, dan program sustainability di Tana Tidung.',
      imagePath: '/assets/images/sop-lingkungan.png',
      features: JSON.stringify([
        'Program konservasi dan reboisasi',
        'Pengelolaan limbah dan sampah',
        'Monitoring kualitas lingkungan',
        'Edukasi lingkungan masyarakat',
        'Sertifikasi green initiatives'
      ]),
      downloadInfo: JSON.stringify({
        fileName: 'SOP-Lingkungan-Konservasi.pdf',
        fileSize: '2.7 MB',
        fileType: 'PDF',
        lastUpdated: '22 Januari 2025',
        url: '#'
      }),
      color: 'teal',
      displayOrder: 7,
      active: true
    },
    {
      title: 'SOP Kerjasama Bidang Pariwisata dan Kebudayaan',
      category: 'Pariwisata & Budaya',
      description: 'Panduan kerjasama untuk pengembangan sektor pariwisata, promosi budaya lokal, dan pelestarian warisan budaya Kabupaten Tana Tidung.',
      imagePath: '/assets/images/sop-pariwisata.png',
      features: JSON.stringify([
        'Pengembangan destinasi wisata',
        'Promosi budaya dan festival',
        'Pelatihan guide dan operator',
        'Marketing digital tourism',
        'Preservasi heritage sites'
      ]),
      downloadInfo: JSON.stringify({
        fileName: 'SOP-Pariwisata-Kebudayaan.pdf',
        fileSize: '2.9 MB',
        fileType: 'PDF',
        lastUpdated: '8 Januari 2025',
        url: '#'
      }),
      color: 'pink',
      displayOrder: 8,
      active: true
    }
  ];

  console.log('📝 Creating SOP documents...');

  for (const docData of sopDocuments) {
    console.log(`✅ Creating SOP document '${docData.title}'...`);
    await prisma.sOPDocument.create({
      data: docData
    });
  }

  console.log('🎉 SOP documents seeding completed successfully!');
  console.log(`📊 Created ${sopDocuments.length} SOP documents`);

  // Verify seeding
  const count = await prisma.sOPDocument.count();
  console.log(`📊 Total SOP documents in database: ${count}`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });