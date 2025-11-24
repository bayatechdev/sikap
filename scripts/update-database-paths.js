#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

console.log('🔄 Starting Database Path Updates...');
console.log('📋 This script will update database records with new folder paths');

async function updateDatabasePaths() {
  try {
    console.log('\n📂 Checking document paths in database...\n');

    // Update Document records (for applications)
    const documents = await prisma.document.findMany({
      where: {
        relativePath: {
          contains: 'documents/'
        }
      }
    });

    console.log(`📄 Found ${documents.length} document records to update`);

    for (const doc of documents) {
      const newPath = doc.relativePath.replace('documents/', 'applications/');

      await prisma.document.update({
        where: { id: doc.id },
        data: { relativePath: newPath }
      });

      console.log(`  ✅ Updated document ${doc.id}: ${doc.relativePath} → ${newPath}`);
    }

    // Update Cooperation records (for cooperation documents)
    const cooperations = await prisma.cooperation.findMany({
      where: {
        documentPath: {
          contains: 'documents/'
        }
      }
    });

    console.log(`\n🤝 Found ${cooperations.length} cooperation records to update`);

    for (const coop of cooperations) {
      const newPath = coop.documentPath.replace('documents/', 'applications/');

      await prisma.cooperation.update({
        where: { id: coop.id },
        data: { documentPath: newPath }
      });

      console.log(`  ✅ Updated cooperation ${coop.id}: ${coop.documentPath} → ${newPath}`);
    }

    // Update LegalDocument records
    const legalDocuments = await prisma.legalDocument.findMany({
      where: {
        relativePath: {
          contains: 'legal-documents/'
        }
      }
    });

    console.log(`\n⚖️  Found ${legalDocuments.length} legal document records to update`);

    for (const legalDoc of legalDocuments) {
      const newPath = legalDoc.relativePath.replace('legal-documents/', 'dasar-hukum/');

      await prisma.legalDocument.update({
        where: { id: legalDoc.id },
        data: { relativePath: newPath }
      });

      console.log(`  ✅ Updated legal document ${legalDoc.id}: ${legalDoc.relativePath} → ${newPath}`);
    }

    // Update SOPDocument records
    const sopDocuments = await prisma.sOPDocument.findMany({
      where: {
        imagePath: {
          contains: 'sop-documents/'
        }
      }
    });

    console.log(`\n📋 Found ${sopDocuments.length} SOP document records to update`);

    for (const sopDoc of sopDocuments) {
      const newPath = sopDoc.imagePath.replace('sop-documents/', 'sop/');

      await prisma.sOPDocument.update({
        where: { id: sopDoc.id },
        data: { imagePath: newPath }
      });

      console.log(`  ✅ Updated SOP document ${sopDoc.id}: ${sopDoc.imagePath} → ${newPath}`);
    }

    console.log('\n✅ Database path updates completed!');
    console.log('\n📊 Summary of changes:');
    console.log(`📄 Documents: ${documents.length} records updated`);
    console.log(`🤝 Cooperations: ${cooperations.length} records updated`);
    console.log(`⚖️  Legal Documents: ${legalDocuments.length} records updated`);
    console.log(`📋 SOP Documents: ${sopDocuments.length} records updated`);

  } catch (error) {
    console.error('❌ Error updating database paths:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  updateDatabasePaths();
}

module.exports = { updateDatabasePaths };