import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSOPDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  imagePath: z.string().optional(),
  features: z.array(z.string()).optional(),
  downloadInfo: z.object({
    fileName: z.string().optional(),
    fileSize: z.string().optional(),
    fileType: z.string().optional(),
    lastUpdated: z.string().optional(),
    url: z.string().optional()
  }).optional(),
  color: z.string().optional(),
  displayOrder: z.number().optional(),
  active: z.boolean().optional(),
});

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  active: z.string().optional().transform(val => val === 'true'),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

// GET /api/sop-documents - List all SOP documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const { search, category, active, limit, offset } = querySchema.parse(queryData);

    // Build where conditions
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (active !== undefined) {
      where.active = active;
    }

    const documents = await prisma.sOPDocument.findMany({
      where,
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
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { title: 'asc' }
      ],
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.sOPDocument.count({ where });

    // Get categories for filtering
    const categories = await prisma.sOPDocument.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    // Parse JSON fields for easier frontend consumption
    const processedDocuments = documents.map(doc => ({
      ...doc,
      features: doc.features ? (doc.features as string[]) : [],
      downloadInfo: doc.downloadInfo ? (doc.downloadInfo as Record<string, unknown>) : null,
    }));

    return NextResponse.json({
      documents: processedDocuments,
      totalCount,
      categories: categories.map(cat => ({
        name: cat.category,
        count: cat._count.category,
      })),
      pagination: {
        limit,
        offset,
        hasMore: totalCount > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error fetching SOP documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOP documents', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/sop-documents - Create new SOP document
export async function POST(request: NextRequest) {
  try {
    // Check authentication (admin only)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSOPDocumentSchema.parse(body);

    // Convert arrays to JSON for storage
    const dbData = {
      ...validatedData,
      features: validatedData.features ? JSON.stringify(validatedData.features) : null,
      downloadInfo: validatedData.downloadInfo ? JSON.stringify(validatedData.downloadInfo) : null,
    };

    const sopDocument = await prisma.sOPDocument.create({
      data: {
        ...dbData,
        features: dbData.features || undefined,
        downloadInfo: dbData.downloadInfo || undefined,
      },
    });

    return NextResponse.json(sopDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating SOP document:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create SOP document' },
      { status: 500 }
    );
  }
}