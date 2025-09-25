import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Import the existing kerjasama.json data
const kerjasamaDataPath = path.join(process.cwd(), 'src', 'data', 'kerjasama.json');
const kerjasamaData = JSON.parse(fs.readFileSync(kerjasamaDataPath, 'utf8'));

async function main() {
  console.log('🔄 Starting cooperation types migration...');

  const cooperationTypes = [
    {
      code: 'mou',
      name: 'Memorandum of Understanding',
      description: 'Memorandum of Understanding (MOU)',
      displayTitle: kerjasamaData.mou.title,
      longDescription: kerjasamaData.mou.description,
      features: JSON.stringify(kerjasamaData.mou.features),
      examples: JSON.stringify(kerjasamaData.mou.examples),
      downloadInfo: JSON.stringify(kerjasamaData.mou.downloadInfo),
      color: kerjasamaData.mou.downloadInfo.color || 'primary',
      icon: kerjasamaData.mou.downloadInfo.icon,
      displayOrder: 1,
      showOnHomepage: true,
      requiredDocumentsJson: JSON.stringify([
        { name: 'Proposal Kerjasama', required: true, formats: 'PDF, DOC, DOCX', maxSize: 10 },
        { name: 'Profil Institusi', required: true, formats: 'PDF, DOC, DOCX', maxSize: 5 },
        { name: 'SK/Akta Pendirian', required: true, formats: 'PDF', maxSize: 5 }
      ]),
      workflowStepsJson: JSON.stringify([
        { step: 1, name: 'Pengajuan Proposal', description: 'Submit proposal kerjasama MOU' },
        { step: 2, name: 'Review Internal', description: 'Tim internal review proposal' },
        { step: 3, name: 'Negosiasi', description: 'Proses negosiasi dan penyesuaian' },
        { step: 4, name: 'Penandatanganan', description: 'Penandatanganan MOU oleh kedua belah pihak' }
      ]),
      active: true
    },
    {
      code: 'pks',
      name: 'Perjanjian Kerjasama',
      description: 'Perjanjian Kerjasama (PKS)',
      displayTitle: kerjasamaData.pks.title,
      longDescription: kerjasamaData.pks.description,
      features: JSON.stringify(kerjasamaData.pks.features),
      examples: JSON.stringify(kerjasamaData.pks.examples),
      downloadInfo: JSON.stringify(kerjasamaData.pks.downloadInfo),
      color: kerjasamaData.pks.downloadInfo.color || 'blue',
      icon: kerjasamaData.pks.downloadInfo.icon,
      displayOrder: 2,
      showOnHomepage: true,
      requiredDocumentsJson: JSON.stringify([
        { name: 'Draft Perjanjian', required: true, formats: 'PDF, DOC, DOCX', maxSize: 10 },
        { name: 'Proposal Teknis', required: true, formats: 'PDF, DOC, DOCX', maxSize: 10 },
        { name: 'Profil Perusahaan/Institusi', required: true, formats: 'PDF, DOC, DOCX', maxSize: 5 },
        { name: 'Dokumen Legal (SIUP/NIB/dll)', required: true, formats: 'PDF', maxSize: 5 }
      ]),
      workflowStepsJson: JSON.stringify([
        { step: 1, name: 'Pengajuan PKS', description: 'Submit draft perjanjian kerjasama' },
        { step: 2, name: 'Review Hukum', description: 'Review legal dan teknis dokumen' },
        { step: 3, name: 'Negosiasi Detail', description: 'Negosiasi klausul dan ketentuan' },
        { step: 4, name: 'Finalisasi', description: 'Finalisasi dokumen perjanjian' },
        { step: 5, name: 'Penandatanganan', description: 'Penandatanganan PKS' }
      ]),
      active: true
    },
    {
      code: 'surat_kuasa',
      name: 'Surat Kuasa Kerjasama',
      description: 'Surat Kuasa untuk Kerjasama',
      displayTitle: kerjasamaData.surat_kuasa.title,
      longDescription: kerjasamaData.surat_kuasa.description,
      features: JSON.stringify(kerjasamaData.surat_kuasa.features),
      examples: JSON.stringify(kerjasamaData.surat_kuasa.examples),
      downloadInfo: JSON.stringify(kerjasamaData.surat_kuasa.downloadInfo),
      color: kerjasamaData.surat_kuasa.downloadInfo.color || 'green',
      icon: kerjasamaData.surat_kuasa.downloadInfo.icon,
      displayOrder: 3,
      showOnHomepage: true,
      requiredDocumentsJson: JSON.stringify([
        { name: 'Surat Permohonan Kuasa', required: true, formats: 'PDF, DOC, DOCX', maxSize: 5 },
        { name: 'Identitas Pemberi Kuasa', required: true, formats: 'PDF', maxSize: 2 },
        { name: 'Identitas Penerima Kuasa', required: true, formats: 'PDF', maxSize: 2 }
      ]),
      workflowStepsJson: JSON.stringify([
        { step: 1, name: 'Pengajuan Kuasa', description: 'Submit permohonan surat kuasa' },
        { step: 2, name: 'Verifikasi Dokumen', description: 'Verifikasi identitas dan kelengkapan' },
        { step: 3, name: 'Persetujuan', description: 'Persetujuan pemberian kuasa' },
        { step: 4, name: 'Penerbitan', description: 'Penerbitan surat kuasa resmi' }
      ]),
      active: true
    },
    {
      code: 'nota_kesepakatan',
      name: 'Nota Kesepakatan',
      description: 'Nota Kesepakatan Kerjasama',
      displayTitle: kerjasamaData.nota_kesepakatan.title,
      longDescription: kerjasamaData.nota_kesepakatan.description,
      features: JSON.stringify(kerjasamaData.nota_kesepakatan.features),
      examples: JSON.stringify(kerjasamaData.nota_kesepakatan.examples),
      downloadInfo: JSON.stringify(kerjasamaData.nota_kesepakatan.downloadInfo),
      color: kerjasamaData.nota_kesepakatan.downloadInfo.color || 'orange',
      icon: kerjasamaData.nota_kesepakatan.downloadInfo.icon,
      displayOrder: 4,
      showOnHomepage: true,
      requiredDocumentsJson: JSON.stringify([
        { name: 'Draft Nota Kesepakatan', required: true, formats: 'PDF, DOC, DOCX', maxSize: 10 },
        { name: 'Latar Belakang Kerjasama', required: true, formats: 'PDF, DOC, DOCX', maxSize: 5 },
        { name: 'Profil Pihak yang Bekerjasama', required: true, formats: 'PDF, DOC, DOCX', maxSize: 5 }
      ]),
      workflowStepsJson: JSON.stringify([
        { step: 1, name: 'Penyusunan Draft', description: 'Penyusunan draft nota kesepakatan' },
        { step: 2, name: 'Diskusi Teknis', description: 'Diskusi dan pembahasan teknis' },
        { step: 3, name: 'Revisi dan Finalisasi', description: 'Revisi berdasarkan masukan' },
        { step: 4, name: 'Penandatanganan', description: 'Penandatanganan nota kesepakatan' }
      ]),
      active: true
    }
  ];

  console.log('📝 Migrating cooperation types data...');

  for (const typeData of cooperationTypes) {
    const existingType = await prisma.cooperationType.findUnique({
      where: { code: typeData.code }
    });

    if (existingType) {
      console.log(`⚠️  Cooperation type '${typeData.code}' already exists, updating...`);
      await prisma.cooperationType.update({
        where: { code: typeData.code },
        data: typeData
      });
    } else {
      console.log(`✅ Creating cooperation type '${typeData.code}'...`);
      await prisma.cooperationType.create({
        data: typeData
      });
    }
  }

  console.log('🎉 Cooperation types migration completed successfully!');
  console.log(`📊 Processed ${cooperationTypes.length} cooperation types`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });