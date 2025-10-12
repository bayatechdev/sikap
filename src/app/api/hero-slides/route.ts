import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for hero slide creation/update
const heroSlideSchema = z.object({
  version: z.enum(['split', 'full']),
  order: z.number().int().min(1, 'Order must be at least 1'),
  isActive: z.boolean().optional(),
  title: z.string().max(255).nullable().optional(),
  subtitle: z.string().max(500).nullable().optional(),
  imagesJson: z.array(z.object({
    url: z.string().min(1, 'Image URL is required'),
    alt: z.string().optional(),
    title: z.string().optional(),
  })).nullable().optional(),
});

// GET /api/hero-slides - List all hero slides
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const where = activeOnly ? { isActive: true } : {};

    const heroSlides = await prisma.heroSlide.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json({
      success: true,
      heroSlides,
      count: heroSlides.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero slides' },
      { status: 500 }
    );
  }
}

// POST /api/hero-slides - Create a new hero slide
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
    const validatedData = heroSlideSchema.parse(body);

    // Check if order already exists
    const existingSlide = await prisma.heroSlide.findFirst({
      where: { order: validatedData.order },
    });

    if (existingSlide) {
      return NextResponse.json(
        { success: false, error: `Order ${validatedData.order} is already in use` },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      version: validatedData.version,
      order: validatedData.order,
      isActive: validatedData.isActive ?? true,
      title: validatedData.title ?? null,
      subtitle: validatedData.subtitle ?? null,
    };

    if (validatedData.imagesJson !== undefined) {
      createData.imagesJson = validatedData.imagesJson;
    }

    const heroSlide = await prisma.heroSlide.create({
      data: createData,
    });

    return NextResponse.json({
      success: true,
      heroSlide,
      message: 'Hero slide created successfully',
    });
  } catch (error) {
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
      { success: false, error: 'Failed to create hero slide' },
      { status: 500 }
    );
  }
}

// PUT /api/hero-slides - Bulk update hero slide orders
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
    const { heroSlides } = body;

    if (!Array.isArray(heroSlides)) {
      return NextResponse.json(
        { success: false, error: 'Hero slides array is required' },
        { status: 400 }
      );
    }

    // Update hero slide orders in a transaction
    await prisma.$transaction(
      heroSlides.map((slide: { id: number; order: number }) =>
        prisma.heroSlide.update({
          where: { id: slide.id },
          data: { order: slide.order },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Hero slide orders updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update hero slide orders' },
      { status: 500 }
    );
  }
}
