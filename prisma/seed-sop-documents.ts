import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Import the existing sop.json data
const sopDataPath = path.join(process.cwd(), 'src', 'data', 'sop.json');
const sopData = JSON.parse(fs.readFileSync(sopDataPath, 'utf8'));

async function main() {
  console.log('🔄 Starting SOP documents migration...');

  const sopDocuments = [
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
    }
  ];

  console.log('📝 Migrating SOP documents data...');

  for (const docData of sopDocuments) {
    const existingDoc = await prisma.sOPDocument.findFirst({
      where: {
        AND: [
          { title: docData.title },
          { category: docData.category }
        ]
      }
    });

    if (existingDoc) {
      console.log(`⚠️  SOP document '${docData.title}' already exists, updating...`);
      await prisma.sOPDocument.update({
        where: { id: existingDoc.id },
        data: docData
      });
    } else {
      console.log(`✅ Creating SOP document '${docData.title}'...`);
      await prisma.sOPDocument.create({
        data: docData
      });
    }
  }

  console.log('🎉 SOP documents migration completed successfully!');
  console.log(`📊 Processed ${sopDocuments.length} SOP documents`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });