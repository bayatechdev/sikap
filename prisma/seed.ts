import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  console.log('Creating roles...');
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'System Administrator',
      permissionsJson: '["*"]',
    },
  });

  const reviewerRole = await prisma.role.create({
    data: {
      name: 'reviewer',
      description: 'Application Reviewer',
      permissionsJson: '["applications.view", "applications.review", "applications.approve", "documents.view"]',
    },
  });

  const staffRole = await prisma.role.create({
    data: {
      name: 'staff',
      description: 'Government Staff',
      permissionsJson: '["applications.view", "reports.generate", "documents.view"]',
    },
  });

  await prisma.role.create({
    data: {
      name: 'applicant',
      description: 'External Applicant',
      permissionsJson: '["applications.create", "applications.edit_own", "applications.view_own", "documents.upload"]',
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'manager',
      description: 'Department Manager',
      permissionsJson: '["applications.view", "applications.assign", "reports.generate", "users.manage"]',
    },
  });

  // Create users
  console.log('Creating users...');
  const passwordHash = await hash('password123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tanatidung.go.id',
      username: 'admin',
      passwordHash,
      fullName: 'System Administrator',
      phone: '+62-812-1000-0001',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  const reviewer1User = await prisma.user.create({
    data: {
      email: 'reviewer1@tanatidung.go.id',
      username: 'reviewer1',
      passwordHash,
      fullName: 'Ahmad Reviewer',
      phone: '+62-812-1000-0002',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  const reviewer2User = await prisma.user.create({
    data: {
      email: 'reviewer2@tanatidung.go.id',
      username: 'reviewer2',
      passwordHash,
      fullName: 'Siti Reviewer',
      phone: '+62-812-1000-0003',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff1@tanatidung.go.id',
      username: 'staff1',
      passwordHash,
      fullName: 'Budi Staff',
      phone: '+62-812-1000-0004',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager1@tanatidung.go.id',
      username: 'manager1',
      passwordHash,
      fullName: 'Ibu Manager',
      phone: '+62-812-1000-0005',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  // Create system user for public uploads
  await prisma.user.create({
    data: {
      email: 'system@tanatidung.go.id',
      username: 'system',
      passwordHash,
      fullName: 'System User',
      phone: '+62-812-1000-0000',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  // Assign roles to users
  console.log('Assigning roles...');
  await prisma.userRole.createMany({
    data: [
      { userId: adminUser.id, roleId: adminRole.id, assignedBy: adminUser.id },
      { userId: reviewer1User.id, roleId: reviewerRole.id, assignedBy: adminUser.id },
      { userId: reviewer2User.id, roleId: reviewerRole.id, assignedBy: adminUser.id },
      { userId: staffUser.id, roleId: staffRole.id, assignedBy: adminUser.id },
      { userId: managerUser.id, roleId: managerRole.id, assignedBy: adminUser.id },
    ],
  });

  // Create cooperation categories
  console.log('Creating cooperation categories...');
  await prisma.cooperationCategory.createMany({
    data: [
      { name: 'Pendidikan', description: 'Kerjasama di bidang pendidikan dan pengembangan SDM', icon: 'graduation-cap', sortOrder: 1 },
      { name: 'Infrastruktur', description: 'Kerjasama pembangunan infrastruktur dan fasilitas umum', icon: 'building', sortOrder: 2 },
      { name: 'Kesehatan', description: 'Kerjasama di bidang kesehatan dan layanan medis', icon: 'heart', sortOrder: 3 },
      { name: 'Pariwisata', description: 'Kerjasama pengembangan pariwisata dan budaya', icon: 'map', sortOrder: 4 },
      { name: 'Teknologi', description: 'Kerjasama di bidang teknologi informasi dan inovasi', icon: 'computer', sortOrder: 5 },
      { name: 'Lingkungan', description: 'Kerjasama pengelolaan lingkungan dan konservasi', icon: 'leaf', sortOrder: 6 },
      { name: 'Ekonomi', description: 'Kerjasama pengembangan ekonomi dan investasi', icon: 'trending-up', sortOrder: 7 },
      { name: 'Sosial', description: 'Kerjasama pemberdayaan sosial dan masyarakat', icon: 'users', sortOrder: 8 },
    ],
  });

  // Create institutions
  console.log('Creating institutions...');
  await prisma.institution.createMany({
    data: [
      {
        name: 'Universitas Mulawarman',
        type: 'UNIVERSITY',
        code: 'UNMUL',
        address: 'Jl. Kuaro, Gn. Kelua, Kota Samarinda, Kalimantan Timur',
        contactPerson: 'Prof. Dr. Rektor',
        phone: '+62-541-743848',
        email: 'info@unmul.ac.id',
      },
      {
        name: 'PT. Adhi Karya (Persero) Tbk',
        type: 'PRIVATE_COMPANY',
        code: 'ADHI',
        address: 'Jl. Jend. Gatot Subroto Kav. 4, Jakarta Selatan',
        contactPerson: 'Direktur Regional',
        phone: '+62-21-7987000',
        email: 'info@adhikarya.co.id',
      },
      {
        name: 'RSUD Tarakan',
        type: 'HOSPITAL',
        code: 'RSUD_TRK',
        address: 'Jl. Pulau Irian No.1, Tarakan, Kalimantan Utara',
        contactPerson: 'dr. Direktur',
        phone: '+62-551-21118',
        email: 'info@rsudtarakan.go.id',
      },
      {
        name: 'Dinas Pariwisata Prov. Kaltara',
        type: 'GOVERNMENT',
        code: 'DISPAR_KALTARA',
        address: 'Jl. Jend. Sudirman, Tanjung Selor, Kalimantan Utara',
        contactPerson: 'Kepala Dinas',
        phone: '+62-552-21001',
        email: 'dispar@kaltaraprov.go.id',
      },
      {
        name: 'Bank Kaltara',
        type: 'FINANCIAL',
        code: 'BANK_KALTARA',
        address: 'Jl. Jend. Sudirman No.8, Tanjung Selor',
        contactPerson: 'Direktur Utama',
        phone: '+62-552-21234',
        email: 'info@bankkaltara.co.id',
      },
      {
        name: 'LSM Lingkungan Borneo',
        type: 'NGO',
        code: 'LSM_BORNEO',
        address: 'Jl. Mangrove Indah, Tarakan',
        contactPerson: 'Ketua Organisasi',
        phone: '+62-551-31234',
        email: 'info@lsmborneo.org',
      },
    ],
  });

  // Create cooperation types
  console.log('Creating cooperation types...');
  await prisma.cooperationType.createMany({
    data: [
      {
        code: 'mou',
        name: 'Memorandum of Understanding',
        description: 'Perjanjian tidak mengikat secara hukum yang menetapkan kerangka kerjasama',
        requiredDocumentsJson: JSON.stringify([
          { key: "suratPermohonan", name: "Surat Permohonan", required: true },
          { key: "draftMou", name: "Draft MOU", required: true },
          { key: "studiKelayakan", name: "Studi Kelayakan Kerjasama / KAK", required: true },
          { key: "profilKota", name: "Profil Kota", required: true },
          { key: "legalStanding", name: "Legal Standing Perusahaan", required: true },
        ]),
        workflowStepsJson: JSON.stringify([
          { step: "document_verification", name: "Verifikasi Dokumen", assignable_roles: ["reviewer"] },
          { step: "legal_review", name: "Review Legal", assignable_roles: ["reviewer", "manager"] },
          { step: "approval_pending", name: "Persetujuan Akhir", assignable_roles: ["admin", "manager"] },
        ]),
      },
      {
        code: 'pks',
        name: 'Perjanjian Kerjasama',
        description: 'Perjanjian formal yang mengikat secara hukum dengan kewajiban dan hak yang jelas',
        requiredDocumentsJson: JSON.stringify([
          { key: "suratPermohonan", name: "Surat Permohonan", required: true },
          { key: "draftPks", name: "Draft PKS", required: true },
        ]),
        workflowStepsJson: JSON.stringify([
          { step: "document_verification", name: "Verifikasi Dokumen", assignable_roles: ["reviewer"] },
          { step: "legal_review", name: "Review Legal", assignable_roles: ["reviewer", "manager"] },
          { step: "approval_pending", name: "Persetujuan Akhir", assignable_roles: ["admin", "manager"] },
        ]),
      },
      {
        code: 'surat_kuasa',
        name: 'Surat Kuasa Kerjasama',
        description: 'Dokumen legal yang memberikan wewenang kepada pihak tertentu untuk mewakili Pemerintah',
        requiredDocumentsJson: JSON.stringify([
          { key: "suratPermohonan", name: "Surat Permohonan", required: true },
          { key: "draftPks", name: "Draft PKS", required: true },
        ]),
        workflowStepsJson: JSON.stringify([
          { step: "document_verification", name: "Verifikasi Dokumen", assignable_roles: ["reviewer"] },
          { step: "approval_pending", name: "Persetujuan Akhir", assignable_roles: ["admin", "manager"] },
        ]),
      },
      {
        code: 'nota_kesepakatan',
        name: 'Nota Kesepakatan',
        description: 'Dokumen awal yang memuat kesepahaman dasar antara para pihak',
        requiredDocumentsJson: JSON.stringify([
          { key: "suratPermohonan", name: "Surat Permohonan", required: true },
          { key: "draftPks", name: "Draft PKS", required: true },
        ]),
        workflowStepsJson: JSON.stringify([
          { step: "document_verification", name: "Verifikasi Dokumen", assignable_roles: ["reviewer"] },
          { step: "approval_pending", name: "Persetujuan Akhir", assignable_roles: ["admin", "manager"] },
        ]),
      },
    ],
  });

  // Update cooperation types with detailed data
  console.log('Enriching cooperation types...');
  try {
    const kerjasamaDataPath = path.join(process.cwd(), 'src', 'data', 'kerjasama.json');
    const kerjasamaData = JSON.parse(fs.readFileSync(kerjasamaDataPath, 'utf8'));

    const cooperationTypesUpdates = [
      {
        code: 'mou',
        displayTitle: kerjasamaData.mou.title,
        longDescription: kerjasamaData.mou.description,
        features: JSON.stringify(kerjasamaData.mou.features),
        examples: JSON.stringify(kerjasamaData.mou.examples),
        downloadInfo: JSON.stringify(kerjasamaData.mou.downloadInfo),
        color: kerjasamaData.mou.downloadInfo.color || 'primary',
        icon: kerjasamaData.mou.downloadInfo.icon,
        displayOrder: 1,
        showOnHomepage: true,
        active: true
      },
      {
        code: 'pks',
        displayTitle: kerjasamaData.pks.title,
        longDescription: kerjasamaData.pks.description,
        features: JSON.stringify(kerjasamaData.pks.features),
        examples: JSON.stringify(kerjasamaData.pks.examples),
        downloadInfo: JSON.stringify(kerjasamaData.pks.downloadInfo),
        color: kerjasamaData.pks.downloadInfo.color || 'blue',
        icon: kerjasamaData.pks.downloadInfo.icon,
        displayOrder: 2,
        showOnHomepage: true,
        active: true
      },
      {
        code: 'surat_kuasa',
        displayTitle: kerjasamaData.surat_kuasa.title,
        longDescription: kerjasamaData.surat_kuasa.description,
        features: JSON.stringify(kerjasamaData.surat_kuasa.features),
        examples: JSON.stringify(kerjasamaData.surat_kuasa.examples),
        downloadInfo: JSON.stringify(kerjasamaData.surat_kuasa.downloadInfo),
        color: kerjasamaData.surat_kuasa.downloadInfo.color || 'green',
        icon: kerjasamaData.surat_kuasa.downloadInfo.icon,
        displayOrder: 3,
        showOnHomepage: true,
        active: true
      },
      {
        code: 'nota_kesepakatan',
        displayTitle: kerjasamaData.nota_kesepakatan.title,
        longDescription: kerjasamaData.nota_kesepakatan.description,
        features: JSON.stringify(kerjasamaData.nota_kesepakatan.features),
        examples: JSON.stringify(kerjasamaData.nota_kesepakatan.examples),
        downloadInfo: JSON.stringify(kerjasamaData.nota_kesepakatan.downloadInfo),
        color: kerjasamaData.nota_kesepakatan.downloadInfo.color || 'orange',
        icon: kerjasamaData.nota_kesepakatan.downloadInfo.icon,
        displayOrder: 4,
        showOnHomepage: true,
        active: true
      }
    ];

    for (const updateData of cooperationTypesUpdates) {
      await prisma.cooperationType.update({
        where: { code: updateData.code },
        data: updateData
      });
    }
  } catch {
    console.log('⚠️ Kerjasama data file not found, skipping cooperation types enrichment');
  }

  // Create settings
  console.log('Creating settings...');
  await prisma.setting.createMany({
    data: [
      { key: 'app_name', value: 'SIKAP - Sistem Kerjasama Tana Tidung', description: 'Application name displayed in UI', type: 'string' },
      { key: 'app_version', value: '1.0.0', description: 'Current application version', type: 'string' },
      { key: 'max_file_size', value: '5242880', description: 'Maximum file upload size in bytes (5MB)', type: 'integer' },
      { key: 'allowed_file_types', value: 'pdf,doc,docx,jpg,jpeg,png', description: 'Allowed file extensions for upload', type: 'string' },
      { key: 'email_notifications', value: 'true', description: 'Enable email notifications', type: 'boolean' },
      { key: 'auto_assign_reviewer', value: 'false', description: 'Automatically assign applications to available reviewers', type: 'boolean' },
      { key: 'application_deadline_days', value: '30', description: 'Default deadline for application processing (days)', type: 'integer' },
      { key: 'dashboard_refresh_interval', value: '300', description: 'Dashboard auto-refresh interval in seconds', type: 'integer' },
    ],
  });

  // Create legal documents
  console.log('Creating legal documents...');
  await prisma.legalDocument.createMany({
    data: [
      // Undang-Undang
      {
        title: "UU No. 6 Tahun 2014 tentang Desa",
        documentNumber: "UU-06-2014",
        year: "2014",
        category: "Undang-Undang",
        relativePath: "legal-documents/uu-06-2014-desa.pdf",
        description: "Undang-undang yang mengatur tentang desa dan pemerintahan desa",
      },
      {
        title: "UU No. 23 Tahun 2014 tentang Pemerintahan Daerah",
        documentNumber: "UU-23-2014",
        year: "2014",
        category: "Undang-Undang",
        relativePath: "legal-documents/uu-23-2014-pemda.pdf",
        description: "Undang-undang yang mengatur tentang pemerintahan daerah",
      },
      {
        title: "UU No. 5 Tahun 2014 tentang Aparatur Sipil Negara",
        documentNumber: "UU-05-2014",
        year: "2014",
        category: "Undang-Undang",
        relativePath: "legal-documents/uu-05-2014-asn.pdf",
        description: "Undang-undang yang mengatur tentang aparatur sipil negara",
      },
      // Peraturan Pemerintah
      {
        title: "PP No. 28 Tahun 2018 tentang Kerjasama Daerah",
        documentNumber: "PP-28-2018",
        year: "2018",
        category: "Peraturan Pemerintah",
        relativePath: "legal-documents/pp-28-2018-kerjasama-daerah.pdf",
        description: "Peraturan pemerintah yang mengatur tentang kerjasama daerah",
      },
      {
        title: "PP No. 12 Tahun 2019 tentang Pengelolaan Keuangan Daerah",
        documentNumber: "PP-12-2019",
        year: "2019",
        category: "Peraturan Pemerintah",
        relativePath: "legal-documents/pp-12-2019-keuangan-daerah.pdf",
        description: "Peraturan pemerintah yang mengatur tentang pengelolaan keuangan daerah",
      },
      {
        title: "PP No. 16 Tahun 2018 tentang Pengadaan Barang/Jasa Pemerintah",
        documentNumber: "PP-16-2018",
        year: "2018",
        category: "Peraturan Pemerintah",
        relativePath: "legal-documents/pp-16-2018-pengadaan.pdf",
        description: "Peraturan pemerintah yang mengatur tentang pengadaan barang dan jasa pemerintah",
      },
      // Peraturan Menteri
      {
        title: "Permendagri No. 7 Tahun 2019 tentang Kerjasama Daerah",
        documentNumber: "PERMENDAGRI-07-2019",
        year: "2019",
        category: "Peraturan Menteri",
        relativePath: "legal-documents/permendagri-07-2019-kerjasama.pdf",
        description: "Peraturan menteri dalam negeri tentang kerjasama daerah",
      },
      {
        title: "Permenkeu No. 213 Tahun 2013 tentang Sistem Akuntansi Pemerintahan",
        documentNumber: "PERMENKEU-213-2013",
        year: "2013",
        category: "Peraturan Menteri",
        relativePath: "legal-documents/permenkeu-213-2013-akuntansi.pdf",
        description: "Peraturan menteri keuangan tentang sistem akuntansi pemerintahan",
      },
      // Peraturan Daerah
      {
        title: "Perda Kab. Tana Tidung No. 3 Tahun 2020 tentang Kerjasama Daerah",
        documentNumber: "PERDA-TANATIDUNG-03-2020",
        year: "2020",
        category: "Peraturan Daerah",
        relativePath: "legal-documents/perda-tanatidung-03-2020-kerjasama.pdf",
        description: "Peraturan daerah Kabupaten Tana Tidung tentang kerjasama daerah",
      },
      {
        title: "Perda Kab. Tana Tidung No. 5 Tahun 2021 tentang RPJMD 2021-2026",
        documentNumber: "PERDA-TANATIDUNG-05-2021",
        year: "2021",
        category: "Peraturan Daerah",
        relativePath: "legal-documents/perda-tanatidung-05-2021-rpjmd.pdf",
        description: "Peraturan daerah Kabupaten Tana Tidung tentang Rencana Pembangunan Jangka Menengah Daerah 2021-2026",
      },
    ],
  });

  // Create SOP documents
  console.log('Creating SOP documents...');
  const sopDocuments = [
    {
      title: 'Standar Operasional Prosedur Kerjasama Dalam Negeri',
      category: 'Kerjasama Dalam Negeri',
      description: 'SOP untuk menjalin kerjasama dengan instansi/lembaga dalam negeri, termasuk antar daerah, BUMN, dan organisasi nasional lainnya.',
      imagePath: '/assets/images/sop-dalam-negeri.png',
      features: JSON.stringify([
        'Identifikasi dan pemetaan calon mitra',
        'Proses negosiasi dan penyusunan draft',
        'Review legal dan teknis',
        'Penandatanganan dan implementasi',
        'Monitoring dan evaluasi'
      ]),
      downloadInfo: JSON.stringify({
        fileName: 'SOP-Kerjasama-Dalam-Negeri.pdf',
        fileSize: '2.1 MB',
        fileType: 'PDF',
        lastUpdated: '15 Januari 2025',
        url: '#'
      }),
      color: 'blue',
      displayOrder: 1,
      active: true
    },
    {
      title: 'Standar Operasional Prosedur Kerjasama Luar Negeri',
      category: 'Kerjasama Luar Negeri',
      description: 'SOP untuk kerjasama internasional dengan negara lain, organisasi internasional, dan sister city program sesuai regulasi diplomasi Indonesia.',
      imagePath: '/assets/images/sop-luar-negeri.png',
      features: JSON.stringify([
        'Koordinasi dengan Kementerian Luar Negeri',
        'Sister city dan diplomatic relations',
        'International best practices',
        'Cross-border collaboration protocols',
        'Cultural exchange programs'
      ]),
      downloadInfo: JSON.stringify({
        fileName: 'SOP-Kerjasama-Luar-Negeri.pdf',
        fileSize: '2.4 MB',
        fileType: 'PDF',
        lastUpdated: '20 Januari 2025',
        url: '#'
      }),
      color: 'indigo',
      displayOrder: 2,
      active: true
    },
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

  for (const docData of sopDocuments) {
    await prisma.sOPDocument.create({
      data: docData
    });
  }

  // Create dashboard stats
  console.log('Creating dashboard stats...');
  await prisma.dashboardStat.createMany({
    data: [
      { statKey: 'total_applications', statValue: '156', date: new Date() },
      { statKey: 'applications_today', statValue: '5', date: new Date() },
      { statKey: 'applications_pending', statValue: '23', date: new Date() },
      { statKey: 'applications_approved', statValue: '98', date: new Date() },
      { statKey: 'applications_rejected', statValue: '12', date: new Date() },
      { statKey: 'active_users', statValue: '45', date: new Date() },
      { statKey: 'documents_uploaded', statValue: '234', date: new Date() },
      { statKey: 'avg_processing_days', statValue: '7', date: new Date() },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`
📊 Created:
- 5 roles (admin, reviewer, staff, applicant, manager)
- 6 users with hashed passwords (password: password123)
- 8 cooperation categories
- 6 institutions
- 4 application types (MOU, PKS, Surat Kuasa, Nota Kesepakatan)
- 8 system settings
- 10 legal documents
- 8 SOP documents
- 8 dashboard statistics
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });