import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cooperationData = [
  {
    title: "Kerjasama Bidang Pendidikan dan Kesehatan Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae, tempora temporibus. Quidem explicabo nulla nihil praesentium aspernatur numquam, ut optio.",
    cooperationType: "MOU",
    cooperationTypeColor: "primary",
    orgUnit: "Dinas Pendidikan dan Kebudayaan dan Kesehatan dan Kesejahteraan Rakyat",
    partnerInstitution: "Universitas Indonesia",
    cooperationDate: new Date("2024-01-15"),
    location: "Tana Tidung",
    status: "ACTIVE",
  },
  {
    title: "Kerjasama Bidang Kesehatan",
    cooperationType: "PKS",
    cooperationTypeColor: "blue",
    orgUnit: "Dinas Kesehatan",
    partnerInstitution: "RSUD Jakarta",
    cooperationDate: new Date("2024-02-20"),
    location: "Sesayap",
    status: "ACTIVE",
  },
  {
    title: "Kerjasama Pembangunan Infrastruktur",
    cooperationType: "NK",
    cooperationTypeColor: "green",
    orgUnit: "PUPR",
    partnerInstitution: "PT. Konstruksi Nusantara",
    cooperationDate: new Date("2024-03-10"),
    location: "Tana Tidung",
    status: "ACTIVE",
  },
  {
    title: "Kerjasama Bidang Pertanian",
    cooperationType: "MOU",
    cooperationTypeColor: "primary",
    orgUnit: "Dinas Pertanian",
    partnerInstitution: "Institut Pertanian Bogor",
    cooperationDate: new Date("2024-04-05"),
    location: "Sesayap",
    status: "ACTIVE",
  },
  {
    title: "Kerjasama Bidang Pariwisata",
    cooperationType: "PKS",
    cooperationTypeColor: "blue",
    orgUnit: "Dinas Pariwisata",
    partnerInstitution: "Asosiasi Travel Indonesia",
    cooperationDate: new Date("2024-05-12"),
    location: "Tana Tidung",
    status: "ACTIVE",
  },
  {
    title: "Kerjasama Pembangunan Jalan",
    cooperationType: "NK",
    cooperationTypeColor: "green",
    orgUnit: "PUPR",
    partnerInstitution: "PT. Jalan Raya Indonesia",
    cooperationDate: new Date("2024-06-18"),
    location: "Sesayap",
    status: "ACTIVE",
  },
  {
    title: "Kerjasama Bidang Sosial",
    cooperationType: "MOU",
    cooperationTypeColor: "primary",
    orgUnit: "Dinas Sosial",
    partnerInstitution: "Yayasan Sosial Nusantara",
    cooperationDate: new Date("2024-07-22"),
    location: "Tana Tidung",
    status: "ACTIVE",
  },
  {
    title: "Kerjasama Bidang Lingkungan Hidup",
    cooperationType: "PKS",
    cooperationTypeColor: "blue",
    orgUnit: "DLH",
    partnerInstitution: "WWF Indonesia",
    cooperationDate: new Date("2024-08-30"),
    location: "Sesayap",
    status: "ACTIVE",
  },
] as const;

async function main() {
  console.log('Start seeding cooperations...');

  for (const cooperation of cooperationData) {
    await prisma.cooperation.create({
      data: cooperation,
    });
  }

  console.log('Seeding cooperations completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });