#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const BACKUP_DIR = path.join(__dirname, '../uploads-backup');

console.log('🔄 Starting Uploads Reorganization...');
console.log('📁 Source:', UPLOADS_DIR);
console.log('💾 Backup:', BACKUP_DIR);

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Created backup directory');
}

// Helper function to copy files
function copyFileSync(source, destination) {
  const destDir = path.dirname(destination);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(source, destination);
}

// Helper to reorganize files from year/month/day to year/month (ONLY for documents)
function reorganizeDateFolder(folderPath, folderName) {
  if (!fs.existsSync(folderPath)) return;

  console.log(`\n📂 Processing: ${folderPath} (${folderName})`);

  // Skip if this folder shouldn't have date structure
  if (folderName !== 'documents') {
    console.log(`  ⏭️  Skipping - ${folderName} doesn't need date structure`);
    return;
  }

  const yearFolders = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => /^\d{4}$/.test(name));

  for (const year of yearFolders) {
    const yearPath = path.join(folderPath, year);
    console.log(`  📅 Processing year: ${year}`);

    const monthFolders = fs.readdirSync(yearPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => /^\d{2}$/.test(name));

    for (const month of monthFolders) {
      const monthPath = path.join(yearPath, month);
      console.log(`    📆 Processing month: ${month}`);

      const dayFolders = fs.readdirSync(monthPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => /^\d{2}$/.test(name));

      if (dayFolders.length > 0) {
        // Has day folders - need to reorganize
        const newMonthPath = path.join(folderPath, year, month);
        console.log(`      🔄 Moving ${dayFolders.length} day folders to: ${newMonthPath}`);

        for (const day of dayFolders) {
          const dayPath = path.join(monthPath, day);
          const files = fs.readdirSync(dayPath);

          for (const file of files) {
            const sourceFile = path.join(dayPath, file);
            const destFile = path.join(newMonthPath, file);

            // Backup original
            const backupFile = path.join(BACKUP_DIR, folderName, year, month, day, file);
            copyFileSync(sourceFile, backupFile);

            // Move to new location
            copyFileSync(sourceFile, destFile);
            console.log(`        📄 Moved: ${file}`);
          }
        }
      } else {
        // No day folders - already in correct format
        const files = fs.readdirSync(monthPath);
        if (files.length > 0) {
          console.log(`      📁 ${files.length} files already in correct format: ${year}/${month}/`);
        }
      }
    }
  }
}

// Main reorganization process
function reorganize() {
  console.log('\n🚀 Starting reorganization process...\n');

  // 1. Reorganize documents folder (application documents - PERLU tahun/bulan)
  const documentsPath = path.join(UPLOADS_DIR, 'documents');
  reorganizeDateFolder(documentsPath, 'documents');

  // 2. Keep images as is (TANPA sub folder)
  const imagesPath = path.join(UPLOADS_DIR, 'images');
  if (fs.existsSync(imagesPath)) {
    console.log('\n🖼️  Processing images (keeping flat structure)...');
    const files = fs.readdirSync(imagesPath, { withFileTypes: true });
    console.log(`  📁 Found ${files.length} items - keeping as is`);
  }

  // 3. Keep legal-documents as is (TANPA sub folder)
  const legalDocsPath = path.join(UPLOADS_DIR, 'legal-documents');
  if (fs.existsSync(legalDocsPath)) {
    console.log('\n⚖️  Processing legal-documents (keeping flat structure)...');
    const files = fs.readdirSync(legalDocsPath);
    console.log(`  📁 Found ${files.length} files - keeping in flat structure`);
    for (const file of files) {
      console.log(`    📄 ${file}`);
    }
  }

  // 4. Keep sop-documents as is (TANPA sub folder)
  const sopDocsPath = path.join(UPLOADS_DIR, 'sop-documents');
  if (fs.existsSync(sopDocsPath)) {
    console.log('\n📋 Processing sop-documents (keeping flat structure)...');
    const files = fs.readdirSync(sopDocsPath);
    console.log(`  📁 Found ${files.length} files - keeping in flat structure`);
    for (const file of files) {
      console.log(`    📄 ${file}`);
    }
  }

  // 5. Keep cooperation-types as is (organized by ID)
  const coopTypesPath = path.join(UPLOADS_DIR, 'cooperation-types');
  if (fs.existsSync(coopTypesPath)) {
    console.log('\n🏢 cooperation-types folder - keeping organized by ID');
  }

  // 6. Handle nested uploads folder (duplicate structure)
  const nestedUploadsPath = path.join(UPLOADS_DIR, 'uploads');
  if (fs.existsSync(nestedUploadsPath)) {
    console.log('\n🔄 Processing nested uploads folder...');
    const files = fs.readdirSync(nestedUploadsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folder of files) {
      const sourcePath = path.join(nestedUploadsPath, folder);
      const targetPath = path.join(UPLOADS_DIR, folder);

      console.log(`  📁 Moving nested folder: ${folder}`);

      // Backup and move
      const backupPath = path.join(BACKUP_DIR, 'uploads', folder);
      copyFileSync(sourcePath, backupPath);

      if (fs.existsSync(targetPath)) {
        // Merge folders
        const subFiles = fs.readdirSync(sourcePath);
        for (const subFile of subFiles) {
          const sourceFile = path.join(sourcePath, subFile);
          const destFile = path.join(targetPath, subFile);
          copyFileSync(sourceFile, destFile);
        }
      } else {
        // Move entire folder
        fs.renameSync(sourcePath, targetPath);
      }
    }
  }

  console.log('\n✅ Reorganization completed!');
  console.log('💾 Original files backed up to:', BACKUP_DIR);
  console.log('\n📊 Final structure:');
  console.log('├── documents/{year}/{month}/        # Application documents (PERLU sub folder)');
  console.log('├── images/                          # Images (TANPA sub folder)');
  console.log('├── legal-documents/                 # Legal documents (TANPA sub folder)');
  console.log('├── sop-documents/                   # SOP documents (TANPA sub folder)');
  console.log('└── cooperation-types/{id}/          # Cooperation type templates (TANPA sub folder)');
}

// Run if called directly
if (require.main === module) {
  reorganize();
}

module.exports = { reorganize };