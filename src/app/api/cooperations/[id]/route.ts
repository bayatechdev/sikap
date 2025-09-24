import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCooperationSchema = z.object({
  applicationId: z.string().optional(),
  title: z.string().min(1, 'Title is required').optional(),
  cooperationType: z.enum(['MOU', 'PKS', 'NK']).optional(),
  cooperationTypeColor: z.enum(['primary', 'blue', 'green']).optional(),
  orgUnit: z.string().min(1, 'OPD is required').optional(),
  partnerInstitution: z.string().min(1, 'Partner institution is required').optional(),
  cooperationDate: z.string().transform((str) => new Date(str)).optional(),
  startDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  location: z.string().min(1, 'Location is required').optional(),
  description: z.string().optional(),
  objectives: z.string().optional(),
  scope: z.string().optional(),
  documentPath: z.string().optional(),
  documentNumber: z.string().optional(),
  documentSize: z.number().optional(),
  documentMimeType: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'DRAFT']).optional(),
  notes: z.string().optional(),
});

// GET /api/cooperations/[id] - Get single cooperation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cooperation = await prisma.cooperation.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            id: true,
            title: true,
            trackingNumber: true,
            description: true,
            institutionName: true,
            contactPerson: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
      },
    });

    if (!cooperation) {
      return NextResponse.json(
        { error: 'Cooperation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cooperation);
  } catch (error) {
    console.error('Error fetching cooperation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cooperation' },
      { status: 500 }
    );
  }
}

// PUT /api/cooperations/[id] - Update cooperation (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateCooperationSchema.parse(body);

    // Check if cooperation exists
    const existingCooperation = await prisma.cooperation.findUnique({
      where: { id },
    });

    if (!existingCooperation) {
      return NextResponse.json(
        { error: 'Cooperation not found' },
        { status: 404 }
      );
    }

    // Update cooperation
    const cooperation = await prisma.cooperation.update({
      where: { id },
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

    return NextResponse.json(cooperation);
  } catch (error) {
    console.error('Error updating cooperation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update cooperation' },
      { status: 500 }
    );
  }
}

// DELETE /api/cooperations/[id] - Delete cooperation (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if cooperation exists
    const existingCooperation = await prisma.cooperation.findUnique({
      where: { id },
    });

    if (!existingCooperation) {
      return NextResponse.json(
        { error: 'Cooperation not found' },
        { status: 404 }
      );
    }

    // Delete cooperation
    await prisma.cooperation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cooperation deleted successfully' });
  } catch (error) {
    console.error('Error deleting cooperation:', error);
    return NextResponse.json(
      { error: 'Failed to delete cooperation' },
      { status: 500 }
    );
  }
}