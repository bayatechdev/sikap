import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for hero slide update
const heroSlideUpdateSchema = z.object({
  version: z.enum(['split', 'full']).optional(),
  order: z.number().int().min(1, 'Order must be at least 1').optional(),
  isActive: z.boolean().optional(),
  title: z.string().max(255).nullable().optional(),
  subtitle: z.string().max(500).nullable().optional(),
  imagesJson: z.array(z.object({
    url: z.string().min(1, 'Image URL is required'),
    alt: z.string().optional(),
  })).nullable().optional(),
});

// GET /api/hero-slides/[id] - Get single hero slide
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slide ID' },
        { status: 400 }
      );
    }

    const heroSlide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!heroSlide) {
      return NextResponse.json(
        { success: false, error: 'Hero slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      heroSlide
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero slide' },
      { status: 500 }
    );
  }
}

// PUT /api/hero-slides/[id] - Update hero slide
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slide ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = heroSlideUpdateSchema.parse(body);

    // Check if slide exists
    const existingSlide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!existingSlide) {
      return NextResponse.json(
        { success: false, error: 'Hero slide not found' },
        { status: 404 }
      );
    }

    // If order is being changed, check for conflicts
    if (validatedData.order && validatedData.order !== existingSlide.order) {
      const conflictingSlide = await prisma.heroSlide.findFirst({
        where: {
          order: validatedData.order,
          id: { not: id }
        },
      });

      if (conflictingSlide) {
        return NextResponse.json(
          { success: false, error: `Order ${validatedData.order} is already in use by another slide` },
          { status: 400 }
        );
      }
    }

    // Update slide
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...validatedData };
    if (validatedData.imagesJson !== undefined) {
      updateData.imagesJson = validatedData.imagesJson;
    }

    const updatedSlide = await prisma.heroSlide.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      heroSlide: updatedSlide,
      message: 'Hero slide updated successfully',
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
      { success: false, error: 'Failed to update hero slide' },
      { status: 500 }
    );
  }
}

// DELETE /api/hero-slides/[id] - Delete hero slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slide ID' },
        { status: 400 }
      );
    }

    // Check if slide exists
    const existingSlide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!existingSlide) {
      return NextResponse.json(
        { success: false, error: 'Hero slide not found' },
        { status: 404 }
      );
    }

    // Delete slide
    await prisma.heroSlide.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Hero slide deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete hero slide' },
      { status: 500 }
    );
  }
}
