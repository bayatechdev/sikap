import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// Category mapping with icons
const categoryConfig = {
  'Undang-Undang': {
    id: 'undang-undang',
    name: 'Undang-Undang',
    icon: '/assets/images/icons/crown.svg',
  },
  'Peraturan Pemerintah': {
    id: 'peraturan-pemerintah',
    name: 'Peraturan Pemerintah',
    icon: '/assets/images/icons/3d-cube-scan.svg',
  },
  'Peraturan Menteri': {
    id: 'peraturan-menteri',
    name: 'Peraturan Menteri',
    icon: '/assets/images/icons/device-message.svg',
  },
  'Peraturan Daerah': {
    id: 'peraturan-daerah',
    name: 'Peraturan Daerah',
    icon: '/assets/images/icons/note-2.svg',
  },
};

// Helper function to get file size
async function getFileSize(relativePath: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', relativePath);
    const stats = await fs.stat(filePath);
    const fileSizeInBytes = stats.size;

    // Convert to human readable format
    if (fileSizeInBytes < 1024 * 1024) {
      return `${Math.round(fileSizeInBytes / 1024)} KB`;
    } else {
      return `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  } catch {
    return null;
  }
}

// GET /api/legal-documents/homepage - Optimized endpoint for homepage display
export async function GET() {
  try {
    const legalDocuments = await prisma.legalDocument.findMany({
      select: {
        id: true,
        title: true,
        documentNumber: true,
        year: true,
        category: true,
        relativePath: true,
        description: true,
      },
      orderBy: [
        { category: 'asc' },
        { year: 'desc' },
        { title: 'asc' }
      ],
    });

    // Group documents by category and format for frontend
    const categoriesMap = new Map();

    for (const doc of legalDocuments) {
      const categoryKey = doc.category;
      const config = categoryConfig[categoryKey as keyof typeof categoryConfig] || {
        id: categoryKey.toLowerCase().replace(/\s+/g, '-'),
        name: categoryKey,
        icon: '/assets/images/icons/note-2.svg',
      };

      if (!categoriesMap.has(categoryKey)) {
        categoriesMap.set(categoryKey, {
          id: config.id,
          name: config.name,
          icon: config.icon,
          items: [],
        });
      }

      // Get file size
      const fileSize = await getFileSize(doc.relativePath);

      const category = categoriesMap.get(categoryKey);
      category.items.push({
        id: doc.id,
        title: doc.title,
        year: doc.year,
        pdfUrl: `/api/legal-documents/${doc.id}/download`,
        fileSize: fileSize || 'N/A',
        documentNumber: doc.documentNumber,
        description: doc.description,
      });
    }

    // Convert to array and sort categories
    const categories = Array.from(categoriesMap.values()).sort((a, b) => {
      const order = ['undang-undang', 'peraturan-pemerintah', 'peraturan-menteri', 'peraturan-daerah'];
      const aIndex = order.indexOf(a.id);
      const bIndex = order.indexOf(b.id);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      categories,
      totalDocuments: legalDocuments.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching legal documents for homepage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal documents for homepage' },
      { status: 500 }
    );
  }
}