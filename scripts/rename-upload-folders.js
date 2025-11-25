#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const BACKUP_DIR = path.join(__dirname, '../uploads-rename-backup');

console.log('🔄 Starting Uploads Folder Renaming...');
console.log('📁 Source:', UPLOADS_DIR);
console.log('💾 Backup:', BACKUP_DIR);

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Created backup directory');
}

// Helper to copy files
function copyFileSync(source, destination) {
  const destDir = path.dirname(destination);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(source, destination);
}

// Helper to copy entire directory
function copyDirSync(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  for (const file of files) {
    const sourceFile = path.join(source, file);
    const destFile = path.join(destination, file);

    const stats = fs.statSync(sourceFile);
    if (stats.isDirectory()) {
      copyDirSync(sourceFile, destFile);
    } else {
      copyFileSync(sourceFile, destFile);
    }
  }
}

// Main renaming process
function renameFolders() {
  console.log('\n🚀 Starting folder renaming process...\n');

  const foldersToRename = [
    { old: 'documents', new: 'applications', description: 'Application Documents' },
    { old: 'legal-documents', new: 'dasar-hukum', description: 'Legal Documents (Dasar Hukum)' },
    { old: 'sop-documents', new: 'sop', description: 'SOP Documents' },
    { old: 'cooperation-types', new: 'cooperations', description: 'Cooperation Type Templates' }
  ];

  for (const { old, new: newName, description } of foldersToRename) {
    const oldPath = path.join(UPLOADS_DIR, old);
    const newPath = path.join(UPLOADS_DIR, newName);

    if (fs.existsSync(oldPath)) {
      console.log(`\n📂 Processing: ${description}`);
      console.log(`  🔤 ${old} → ${newName}`);

      // Backup original folder
      const backupPath = path.join(BACKUP_DIR, old);
      console.log(`  💾 Backing up to: ${backupPath}`);
      copyDirSync(oldPath, backupPath);

      // Check if new folder already exists
      if (fs.existsSync(newPath)) {
        console.log(`  ⚠️  Warning: ${newName} folder already exists - merging files`);

        // Merge files from old folder to new folder
        const files = fs.readdirSync(oldPath);
        for (const file of files) {
          const sourceFile = path.join(oldPath, file);
          const destFile = path.join(newPath, file);

          const stats = fs.statSync(sourceFile);
          if (stats.isDirectory()) {
            if (!fs.existsSync(destFile)) {
              fs.renameSync(sourceFile, destFile);
            } else {
              // Merge subdirectories
              copyDirSync(sourceFile, destFile);
            }
          } else {
            // If file doesn't exist in destination, move it
            if (!fs.existsSync(destFile)) {
              fs.renameSync(sourceFile, destFile);
              console.log(`    📄 Moved: ${file}`);
            } else {
              // File already exists, copy with timestamp
              const timestamp = Date.now();
              const ext = path.extname(file);
              const nameWithoutExt = path.basename(file, ext);
              const newFileName = `${nameWithoutExt}_${timestamp}${ext}`;
              const newDestFile = path.join(newPath, newFileName);
              fs.renameSync(sourceFile, newDestFile);
              console.log(`    📄 Moved (renamed): ${file} → ${newFileName}`);
            }
          }
        }

        // Remove empty old folder
        try {
          fs.rmdirSync(oldPath);
          console.log(`  🗑️  Removed empty folder: ${old}`);
        } catch {
          console.log(`  ⚠️  Could not remove folder (may not be empty): ${old}`);
        }
      } else {
        // Simply rename the folder
        fs.renameSync(oldPath, newPath);
        console.log(`  ✅ Renamed successfully`);
      }

      console.log(`  📁 New path: ${newPath}`);
    } else {
      console.log(`\n⏭️  Skipping: ${old} (doesn't exist)`);
    }
  }

  console.log('\n✅ Folder renaming completed!');
  console.log('💾 Original folders backed up to:', BACKUP_DIR);
  console.log('\n📊 New folder structure:');
  console.log('├── applications/{year}/{month}/       # Application documents (permohonan)');
  console.log('├── dasar-hukum/                        # Legal documents (UU, Perpu, dll)');
  console.log('├── sop/                               # SOP documents');
  console.log('├── cooperations/{id}/                # Cooperation type templates');
  console.log('└── images/                            # Images (hero, logos, dll)');
}

// Run if called directly
if (require.main === module) {
  renameFolders();
}

module.exports = { renameFolders };