import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/sop-documents/homepage - Get SOP documents optimized for homepage display
export async function GET() {
  try {
    const documents = await prisma.sOPDocument.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        imagePath: true,
        features: true,
        downloadInfo: true,
        color: true,
        displayOrder: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { title: 'asc' }
      ],
    });

    // Transform data to match the frontend SOPData interface
    const transformedData: Record<string, unknown> = {};

    documents.forEach(doc => {
      // Create a key based on category - map to expected keys
      let key: string;
      if (doc.category.toLowerCase().includes('dalam negeri') || doc.category.toLowerCase().includes('domestik')) {
        key = 'dalam_negeri';
      } else if (doc.category.toLowerCase().includes('luar negeri') || doc.category.toLowerCase().includes('internasional')) {
        key = 'luar_negeri';
      } else {
        // Fallback - create key from category
        key = doc.category.toLowerCase().replace(/\s+/g, '_');
      }

      // Parse JSON fields properly
      const parsedFeatures = doc.features
        ? (typeof doc.features === 'string' ? JSON.parse(doc.features) : doc.features)
        : [];

      const parsedDownloadInfo = doc.downloadInfo
        ? (typeof doc.downloadInfo === 'string' ? JSON.parse(doc.downloadInfo) : doc.downloadInfo)
        : {
            fileName: 'SOP-Document.pdf',
            fileSize: '1.0 MB',
            fileType: 'PDF',
            lastUpdated: new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            url: '#'
          };

      transformedData[key] = {
        title: doc.title,
        category: doc.category,
        description: doc.description,
        image: doc.imagePath || '/assets/images/kesber_domestik.png', // Default image
        features: parsedFeatures,
        downloadInfo: parsedDownloadInfo,
        color: doc.color || 'primary'
      };
    });

    // Ensure we have the expected structure even if no data
    if (!transformedData.dalam_negeri) {
      transformedData.dalam_negeri = {
        title: 'Standar Operasional Prosedur Kerjasama Dalam Negeri',
        category: 'Prosedur Domestik',
        description: 'Panduan lengkap untuk proses kerjasama domestik.',
        image: '/assets/images/kesber_domestik.png',
        features: [],
        downloadInfo: {
          fileName: 'SOP-Dalam-Negeri.pdf',
          fileSize: '1.0 MB',
          fileType: 'PDF',
          lastUpdated: new Date().toLocaleDateString('id-ID'),
          url: '#'
        },
        color: 'primary'
      };
    }

    if (!transformedData.luar_negeri) {
      transformedData.luar_negeri = {
        title: 'Standar Operasional Prosedur Kerjasama Luar Negeri',
        category: 'Prosedur Internasional',
        description: 'Panduan lengkap untuk proses kerjasama internasional.',
        image: '/assets/images/kesber_inter.png',
        features: [],
        downloadInfo: {
          fileName: 'SOP-Luar-Negeri.pdf',
          fileSize: '1.0 MB',
          fileType: 'PDF',
          lastUpdated: new Date().toLocaleDateString('id-ID'),
          url: '#'
        },
        color: 'blue'
      };
    }

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching SOP documents for homepage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOP documents' },
      { status: 500 }
    );
  }
}