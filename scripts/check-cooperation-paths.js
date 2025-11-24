#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('🔍 Checking cooperation document paths...');

async function checkCooperationPaths() {
  try {
    // Get all cooperations with document paths
    const cooperations = await prisma.cooperation.findMany({
      where: {
        documentPath: {
          not: null
        }
      },
      select: {
        id: true,
        partnerInstitution: true,
        documentPath: true,
        documentNumber: true
      }
    });

    console.log(`\n📄 Found ${cooperations.length} cooperations with documents:\n`);

    for (const coop of cooperations) {
      console.log(`🤝 ${coop.partnerInstitution} (${coop.id})`);
      console.log(`   📁 documentPath: ${coop.documentPath}`);
      console.log(`   📋 documentNumber: ${coop.documentNumber || 'null'}`);
      console.log('');

      // Check if path contains incorrect folder
      if (coop.documentPath && coop.documentPath.includes('dasar-hukum')) {
        console.log(`   ⚠️  ERROR: Should be in kerjasama/ folder, not dasar-hukum/!`);
      }
    }

    // Look for any records that need fixing
    const needsFix = cooperations.filter(coop =>
      coop.documentPath && (
        coop.documentPath.includes('dasar-hukum/') ||
        coop.documentPath.includes('documents/') ||
        coop.documentPath.includes('legal-documents/') ||
        coop.documentPath.includes('sop-documents/')
      )
    );

    if (needsFix.length > 0) {
      console.log(`\n🔧 Found ${needsFix.length} records that need fixing:`);

      for (const coop of needsFix) {
        // Extract filename from current path
        let filename = coop.documentPath.split('/').pop();
        let newPath = `kerjasama/${filename}`;

        console.log(`\n   🔄 ${coop.partnerInstitution}:`);
        console.log(`      From: ${coop.documentPath}`);
        console.log(`      To:   ${newPath}`);

              // Fix the database record
        await prisma.cooperation.update({
          where: { id: coop.id },
          data: { documentPath: newPath }
        });
        console.log(`      ✅ Fixed!`);
      }

      console.log(`\n💡 To fix these records, uncomment the update lines in the script.`);
    } else {
      console.log(`✅ All cooperation document paths look correct!`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkCooperationPaths();
}

module.exports = { checkCooperationPaths };