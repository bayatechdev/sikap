import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

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
      {
        title: 'Peraturan Daerah tentang Kerjasama Daerah',
        documentNumber: 'Perda No. 5',
        year: '2023',
        category: 'perda',
        relativePath: 'legal/perda_05_2023.pdf',
        description: 'Peraturan Daerah yang mengatur tentang mekanisme kerjasama daerah',
      },
      {
        title: 'Pedoman Teknis Kerjasama Pemerintah',
        documentNumber: 'SK Bupati No. 123',
        year: '2023',
        category: 'sk_bupati',
        relativePath: 'legal/sk_123_2023.pdf',
        description: 'Pedoman teknis pelaksanaan kerjasama pemerintah daerah',
      },
      {
        title: 'SOP Pengelolaan Dokumen Kerjasama',
        documentNumber: 'SOP/001/2023',
        year: '2023',
        category: 'sop',
        relativePath: 'legal/sop_001_2023.pdf',
        description: 'Standard Operating Procedure untuk pengelolaan dokumen kerjasama',
      },
    ],
  });

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
- 5 users with hashed passwords (password: password123)
- 8 cooperation categories
- 6 institutions
- 4 application types (MOU, PKS, Surat Kuasa, Nota Kesepakatan)
- 8 system settings
- 3 legal documents
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