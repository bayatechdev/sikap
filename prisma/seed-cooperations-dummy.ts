import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cooperationTypes = [
  { type: 'MOU', color: 'primary' },
  { type: 'PKS', color: 'blue' },
  { type: 'Nota Kesepakatan', color: 'orange' },
  { type: 'Surat Kuasa', color: 'green' },
];

const orgUnits = [
  'Dinas Pendidikan dan Kebudayaan',
  'Dinas Kesehatan',
  'Dinas Pekerjaan Umum dan Penataan Ruang',
  'Dinas Pertanian dan Ketahanan Pangan',
  'Dinas Pariwisata',
  'Dinas Sosial',
  'Dinas Lingkungan Hidup',
  'Dinas Perhubungan',
  'Dinas Komunikasi dan Informatika',
  'Dinas Perdagangan dan Perindustrian',
  'Badan Perencanaan Pembangunan Daerah',
  'Badan Pengelolaan Keuangan dan Aset Daerah',
  'Dinas Pemberdayaan Masyarakat dan Desa',
  'Dinas Kependudukan dan Pencatatan Sipil',
  'Sekretariat Daerah',
];

const partnerInstitutions = [
  'Universitas Indonesia',
  'Universitas Gadjah Mada',
  'Institut Teknologi Bandung',
  'Universitas Mulawarman',
  'RSUD Tarakan',
  'PT. Pertamina (Persero)',
  'PT. PLN (Persero)',
  'PT. Telkom Indonesia',
  'Bank Kaltara',
  'Bank BRI',
  'Kementerian PUPR',
  'Kementerian Pertanian',
  'Kementerian Kesehatan',
  'WWF Indonesia',
  'UNICEF Indonesia',
  'Asosiasi Pemerintah Kabupaten Seluruh Indonesia',
  'PT. Konstruksi Nusantara',
  'Yayasan Pendidikan Kaltara',
  'Lembaga Pembiayaan Ekspor Indonesia',
  'Badan Usaha Milik Daerah Kaltara',
  'Institut Pertanian Bogor',
  'Universitas Borneo Tarakan',
  'PT. Jasa Raharja',
  'BPJS Ketenagakerjaan',
  'BPJS Kesehatan',
];

const locations = [
  'Tana Tidung',
  'Sesayap',
  'Sesayap Hilir',
  'Betayau',
  'Muruk Rian',
  'Jakarta',
  'Tarakan',
  'Samarinda',
  'Balikpapan',
];

const titleTemplates = [
  'Kerjasama Bidang {bidang} antara Pemerintah Kabupaten Tana Tidung dengan {mitra}',
  'Perjanjian Kerjasama Pengembangan {bidang} dengan {mitra}',
  'Nota Kesepakatan Peningkatan Kapasitas {bidang} bersama {mitra}',
  'MOU Pembangunan dan Penguatan {bidang} dengan {mitra}',
  'Kerjasama Teknis {bidang} antara Pemkab Tana Tidung dan {mitra}',
];

const bidangList = [
  'Pendidikan',
  'Kesehatan',
  'Infrastruktur',
  'Pertanian',
  'Pariwisata',
  'Lingkungan Hidup',
  'Teknologi Informasi',
  'Pemberdayaan Masyarakat',
  'Perdagangan',
  'Industri',
  'Perhubungan',
  'Sosial',
  'Kependudukan',
  'Perencanaan Daerah',
  'Keuangan Daerah',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateTitle(mitra: string): string {
  const template = randomFrom(titleTemplates);
  const bidang = randomFrom(bidangList);
  return template.replace('{bidang}', bidang).replace('{mitra}', mitra);
}

async function main() {
  console.log('Generating 50 dummy cooperations...');

  // Cek existing data
  const existingCount = await prisma.cooperation.count();
  console.log(`Current cooperation count: ${existingCount}`);

  const records = Array.from({ length: 50 }, (_, i) => {
    const ct = randomFrom(cooperationTypes);
    const partner = randomFrom(partnerInstitutions);
    const date = randomDate(new Date('2021-01-01'), new Date('2025-12-31'));

    return {
      title: generateTitle(partner),
      cooperationType: ct.type,
      cooperationTypeColor: ct.color,
      orgUnit: randomFrom(orgUnits),
      partnerInstitution: partner,
      cooperationDate: date,
      location: randomFrom(locations),
      status: 'ACTIVE' as const,
    };
  });

  await prisma.cooperation.createMany({ data: records });

  const newCount = await prisma.cooperation.count();
  console.log(`Done. Total cooperations now: ${newCount}`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
