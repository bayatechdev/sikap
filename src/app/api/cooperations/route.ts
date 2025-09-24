import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const createCooperationSchema = z.object({
  applicationId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  cooperationType: z.enum(['MOU', 'PKS', 'NK']),
  cooperationTypeColor: z.enum(['primary', 'blue', 'green']),
  orgUnit: z.string().min(1, 'OPD is required'),
  partnerInstitution: z.string().min(1, 'Partner institution is required'),
  cooperationDate: z.string().transform((str) => new Date(str)),
  startDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  objectives: z.string().optional(),
  scope: z.string().optional(),
  documentPath: z.string().optional(),
  documentNumber: z.string().optional(),
  documentSize: z.number().optional(),
  documentMimeType: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'DRAFT']).default('ACTIVE'),
  notes: z.string().optional(),
});

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  cooperationType: z.string().optional(),
  orgUnit: z.string().optional(),
  location: z.string().optional(),
  year: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'DRAFT']).optional(),
});

// GET /api/cooperations - List cooperations with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const { page, limit, search, cooperationType, orgUnit, location, year, status } =
      querySchema.parse(queryData);

    // Build where conditions
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { partnerInstitution: { contains: search, mode: 'insensitive' } },
        { orgUnit: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (cooperationType) {
      where.cooperationType = cooperationType;
    }

    if (orgUnit) {
      where.orgUnit = orgUnit;
    }

    if (location) {
      where.location = location;
    }

    if (year) {
      const startOfYear = new Date(`${year}-01-01`);
      const endOfYear = new Date(`${year}-12-31`);
      where.cooperationDate = {
        gte: startOfYear,
        lte: endOfYear,
      };
    }

    if (status) {
      where.status = status;
    }

    // Get cooperations with pagination
    const [cooperations, total] = await Promise.all([
      prisma.cooperation.findMany({
        where,
        include: {
          application: {
            select: {
              id: true,
              title: true,
              trackingNumber: true,
            },
          },
        },
        orderBy: { cooperationDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cooperation.count({ where }),
    ]);

    // Get filter options
    const filterOptions = await prisma.cooperation.findMany({
      where: status ? { status } : {},
      select: {
        cooperationType: true,
        orgUnit: true,
        location: true,
        cooperationDate: true,
      },
      distinct: ['cooperationType', 'orgUnit', 'location'],
    });

    const uniqueValues = {
      cooperationType: [...new Set(filterOptions.map(c => c.cooperationType))],
      orgUnit: [...new Set(filterOptions.map(c => c.orgUnit))],
      location: [...new Set(filterOptions.map(c => c.location))],
      year: [...new Set(filterOptions.map(c => c.cooperationDate.getFullYear().toString()))],
    };

    return NextResponse.json({
      cooperations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: uniqueValues,
    });
  } catch (error) {
    console.error('Error fetching cooperations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cooperations' },
      { status: 500 }
    );
  }
}

// POST /api/cooperations - Create new cooperation (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCooperationSchema.parse(body);

    // Create cooperation
    const cooperation = await prisma.cooperation.create({
      data: validatedData,
      include: {
        application: {
          select: {
            id: true,
            title: true,
            trackingNumber: true,
          },
        },
      },
    });

    return NextResponse.json(cooperation, { status: 201 });
  } catch (error) {
    console.error('Error creating cooperation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create cooperation' },
      { status: 500 }
    );
  }
}