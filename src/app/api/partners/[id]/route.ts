import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for partner update
const partnerUpdateSchema = z.object({
  name: z.string().min(1, 'Partner name is required').max(255).optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/partners/[id] - Get specific partner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const partnerId = parseInt(resolvedParams.id);

    if (isNaN(partnerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      partner,
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

// PUT /api/partners/[id] - Update specific partner
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

    const resolvedParams = await params;
    const partnerId = parseInt(resolvedParams.id);

    if (isNaN(partnerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = partnerUpdateSchema.parse(body);

    // Check if partner exists
    const existingPartner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Convert empty strings to null for optional fields
    const updateData: Record<string, string | number | boolean | null> = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.logoUrl !== undefined) updateData.logoUrl = validatedData.logoUrl;
    if (validatedData.website !== undefined) updateData.website = validatedData.website || null;
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null;
    if (validatedData.order !== undefined) updateData.order = validatedData.order;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      partner,
      message: 'Partner updated successfully',
    });
  } catch (error) {
    console.error('Error updating partner:', error);

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
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// DELETE /api/partners/[id] - Delete specific partner
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

    const resolvedParams = await params;
    const partnerId = parseInt(resolvedParams.id);

    if (isNaN(partnerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    // Check if partner exists
    const existingPartner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Delete the partner logo file if it's an uploaded file
    if (existingPartner.logoUrl.startsWith('/uploads/')) {
      const filename = existingPartner.logoUrl.split('/').pop();
      if (filename) {
        try {
          await fetch(`${request.nextUrl.origin}/api/upload/image?filename=${filename}`, {
            method: 'DELETE'
          });
        } catch (error) {
          console.warn('Failed to delete partner logo file:', error);
        }
      }
    }

    // Delete the partner
    await prisma.partner.delete({
      where: { id: partnerId },
    });

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}