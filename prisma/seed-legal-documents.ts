import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const legalDocumentsData = [
  // Undang-Undang
  {
    title: "UU No. 6 Tahun 2014 tentang Desa",
    documentNumber: "UU-06-2014",
    year: "2014",
    category: "Undang-Undang",
    relativePath: "/uploads/legal-documents/uu-06-2014-desa.pdf",
    description: "Undang-undang yang mengatur tentang desa dan pemerintahan desa",
  },
  {
    title: "UU No. 23 Tahun 2014 tentang Pemerintahan Daerah",
    documentNumber: "UU-23-2014",
    year: "2014",
    category: "Undang-Undang",
    relativePath: "/uploads/legal-documents/uu-23-2014-pemda.pdf",
    description: "Undang-undang yang mengatur tentang pemerintahan daerah",
  },
  {
    title: "UU No. 5 Tahun 2014 tentang Aparatur Sipil Negara",
    documentNumber: "UU-05-2014",
    year: "2014",
    category: "Undang-Undang",
    relativePath: "/uploads/legal-documents/uu-05-2014-asn.pdf",
    description: "Undang-undang yang mengatur tentang aparatur sipil negara",
  },
  // Peraturan Pemerintah
  {
    title: "PP No. 28 Tahun 2018 tentang Kerjasama Daerah",
    documentNumber: "PP-28-2018",
    year: "2018",
    category: "Peraturan Pemerintah",
    relativePath: "/uploads/legal-documents/pp-28-2018-kerjasama-daerah.pdf",
    description: "Peraturan pemerintah yang mengatur tentang kerjasama daerah",
  },
  {
    title: "PP No. 12 Tahun 2019 tentang Pengelolaan Keuangan Daerah",
    documentNumber: "PP-12-2019",
    year: "2019",
    category: "Peraturan Pemerintah",
    relativePath: "/uploads/legal-documents/pp-12-2019-keuangan-daerah.pdf",
    description: "Peraturan pemerintah yang mengatur tentang pengelolaan keuangan daerah",
  },
  {
    title: "PP No. 16 Tahun 2018 tentang Pengadaan Barang/Jasa Pemerintah",
    documentNumber: "PP-16-2018",
    year: "2018",
    category: "Peraturan Pemerintah",
    relativePath: "/uploads/legal-documents/pp-16-2018-pengadaan.pdf",
    description: "Peraturan pemerintah yang mengatur tentang pengadaan barang dan jasa pemerintah",
  },
  // Peraturan Menteri
  {
    title: "Permendagri No. 7 Tahun 2019 tentang Kerjasama Daerah",
    documentNumber: "PERMENDAGRI-07-2019",
    year: "2019",
    category: "Peraturan Menteri",
    relativePath: "/uploads/legal-documents/permendagri-07-2019-kerjasama.pdf",
    description: "Peraturan menteri dalam negeri tentang kerjasama daerah",
  },
  {
    title: "Permenkeu No. 213 Tahun 2013 tentang Sistem Akuntansi Pemerintahan",
    documentNumber: "PERMENKEU-213-2013",
    year: "2013",
    category: "Peraturan Menteri",
    relativePath: "/uploads/legal-documents/permenkeu-213-2013-akuntansi.pdf",
    description: "Peraturan menteri keuangan tentang sistem akuntansi pemerintahan",
  },
  // Peraturan Daerah
  {
    title: "Perda Kab. Tana Tidung No. 3 Tahun 2020 tentang Kerjasama Daerah",
    documentNumber: "PERDA-TANATIDUNG-03-2020",
    year: "2020",
    category: "Peraturan Daerah",
    relativePath: "/uploads/legal-documents/perda-tanatidung-03-2020-kerjasama.pdf",
    description: "Peraturan daerah Kabupaten Tana Tidung tentang kerjasama daerah",
  },
  {
    title: "Perda Kab. Tana Tidung No. 5 Tahun 2021 tentang RPJMD 2021-2026",
    documentNumber: "PERDA-TANATIDUNG-05-2021",
    year: "2021",
    category: "Peraturan Daerah",
    relativePath: "/uploads/legal-documents/perda-tanatidung-05-2021-rpjmd.pdf",
    description: "Peraturan daerah Kabupaten Tana Tidung tentang Rencana Pembangunan Jangka Menengah Daerah 2021-2026",
  },
];

export async function seedLegalDocuments() {
  console.log('🌱 Seeding legal documents...');

  try {
    // Clear existing legal documents
    await prisma.legalDocument.deleteMany({});
    console.log('✅ Cleared existing legal documents');

    // Create legal documents
    for (const docData of legalDocumentsData) {
      await prisma.legalDocument.create({
        data: docData,
      });
    }

    console.log(`✅ Created ${legalDocumentsData.length} legal documents`);

    // Log summary by category
    const summary = await prisma.legalDocument.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    console.log('📊 Legal documents summary:');
    summary.forEach(item => {
      console.log(`   ${item.category}: ${item._count.category} documents`);
    });

  } catch (error) {
    console.error('❌ Error seeding legal documents:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedLegalDocuments()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}