import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for partner creation/update
const partnerSchema = z.object({
  name: z.string().min(1, 'Partner name is required').max(255),
  logoUrl: z.string().min(1, 'Logo URL is required'),
  website: z.union([
    z.string().url('Invalid website URL'),
    z.literal(''),
    z.null()
  ]).optional(),
  description: z.union([
    z.string().max(500),
    z.literal(''),
    z.null()
  ]).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/partners - List all partners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    // const includeInactive = searchParams.get('includeInactive') === 'true';

    const where = activeOnly ? { isActive: true } : {};

    const partners = await prisma.partner.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json({
      success: true,
      partners,
      count: partners.length
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// POST /api/partners - Create a new partner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = partnerSchema.parse(body);

    // Get the highest order number and add 1
    const lastPartner = await prisma.partner.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = validatedData.order ?? (lastPartner?.order ?? 0) + 1;

    // Convert empty strings to null for optional fields
    const partnerData = {
      name: validatedData.name,
      logoUrl: validatedData.logoUrl,
      website: validatedData.website || null,
      description: validatedData.description || null,
      order,
      isActive: validatedData.isActive ?? true,
    };

    const partner = await prisma.partner.create({
      data: partnerData,
    });

    return NextResponse.json({
      success: true,
      partner,
      message: 'Partner created successfully',
    });
  } catch (error) {
    console.error('Error creating partner:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}

// PUT /api/partners - Bulk update partner orders
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { partners } = body;

    if (!Array.isArray(partners)) {
      return NextResponse.json(
        { success: false, error: 'Partners array is required' },
        { status: 400 }
      );
    }

    // Update partner orders in a transaction
    await prisma.$transaction(
      partners.map((partner: { id: number; order: number }) =>
        prisma.partner.update({
          where: { id: partner.id },
          data: { order: partner.order },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Partner orders updated successfully',
    });
  } catch (error) {
    console.error('Error updating partner orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner orders' },
      { status: 500 }
    );
  }
}