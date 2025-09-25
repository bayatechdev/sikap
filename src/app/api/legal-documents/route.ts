import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createLegalDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  documentNumber: z.string().min(1, 'Document number is required'),
  year: z.string().min(4, 'Year is required'),
  category: z.string().min(1, 'Category is required'),
  relativePath: z.string().min(1, 'File path is required'),
  description: z.string().optional(),
});

const querySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

// GET /api/legal-documents - List all legal documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const { category, search, limit, offset } = querySchema.parse(queryData);

    // Build where conditions
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const documents = await prisma.legalDocument.findMany({
      where,
      select: {
        id: true,
        title: true,
        documentNumber: true,
        year: true,
        category: true,
        relativePath: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { category: 'asc' },
        { year: 'desc' },
        { title: 'asc' }
      ],
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.legalDocument.count({ where });

    // Get categories for filtering
    const categories = await prisma.legalDocument.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return NextResponse.json({
      documents,
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
    console.error('Error fetching legal documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal documents' },
      { status: 500 }
    );
  }
}

// POST /api/legal-documents - Create new legal document
export async function POST(request: NextRequest) {
  try {
    // Check authentication (admin only)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createLegalDocumentSchema.parse(body);

    // Check if document number already exists
    const existingDocument = await prisma.legalDocument.findUnique({
      where: { documentNumber: validatedData.documentNumber },
    });

    if (existingDocument) {
      return NextResponse.json(
        { error: 'Document number already exists' },
        { status: 400 }
      );
    }

    const legalDocument = await prisma.legalDocument.create({
      data: validatedData,
    });

    return NextResponse.json(legalDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating legal document:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create legal document' },
      { status: 500 }
    );
  }
}