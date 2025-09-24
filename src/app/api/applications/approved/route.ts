import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  search: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
});

// GET /api/applications/approved - Get approved applications for cooperation form
export async function GET(request: NextRequest) {
  try {
    // Check authentication (admin only)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const { search, limit } = querySchema.parse(queryData);

    // Build where conditions
    const where: Record<string, unknown> = {
      status: 'APPROVED',
      cooperations: {
        none: {}, // Only applications that haven't been converted to cooperations
      },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { institutionName: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        institutionName: true,
        contactPerson: true,
        contactEmail: true,
        contactPhone: true,
        trackingNumber: true,
        approvedAt: true,
        applicationType: {
          select: {
            name: true,
          },
        },
        cooperationCategory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { approvedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      applications,
      total: applications.length,
    });
  } catch (error) {
    console.error('Error fetching approved applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approved applications' },
      { status: 500 }
    );
  }
}