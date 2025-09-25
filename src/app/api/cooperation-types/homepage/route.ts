import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cooperation-types/homepage - Optimized endpoint for homepage display
export async function GET() {
  try {
    const cooperationTypes = await prisma.cooperationType.findMany({
      where: {
        active: true,
        showOnHomepage: true
      },
      select: {
        code: true,
        displayTitle: true,
        longDescription: true,
        features: true,
        examples: true,
        downloadInfo: true,
        color: true,
        icon: true,
        displayOrder: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    // Process data for homepage consumption (matching kerjasama.json structure)
    const homepageData: Record<string, unknown> = {};

    cooperationTypes.forEach(type => {
      if (type.code) {
        // Helper function to safely parse JSON
        const safeJsonParse = (value: unknown, fallback: unknown = null) => {
          if (typeof value === 'string') {
            try {
              return JSON.parse(value);
            } catch {
              return fallback;
            }
          }
          return value || fallback;
        };

        homepageData[type.code] = {
          title: type.displayTitle || type.code.toUpperCase(),
          description: type.longDescription || '',
          features: safeJsonParse(type.features, []),
          examples: safeJsonParse(type.examples, []),
          downloadInfo: safeJsonParse(type.downloadInfo, {
            fileName: '',
            fileSize: '',
            fileType: '',
            docType: '',
            color: type.color || 'primary',
            icon: type.icon || ''
          })
        };
      }
    });

    return NextResponse.json(homepageData);
  } catch (error) {
    console.error('Error fetching cooperation types for homepage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cooperation types for homepage' },
      { status: 500 }
    );
  }
}