import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (query.length < 2) {
      return NextResponse.json({ institutions: [] });
    }

    const institutions = await prisma.institution.findMany({
      where: {
        AND: [
          { active: true },
          {
            OR: [
              {
                name: {
                  contains: query
                }
              },
              {
                code: {
                  contains: query
                }
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        code: true,
        contactPerson: true,
        phone: true,
        email: true,
      },
      take: limit,
      orderBy: [
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ institutions });
  } catch (error) {
    console.error('Error searching institutions:', error);
    return NextResponse.json(
      { error: 'Failed to search institutions' },
      { status: 500 }
    );
  }
}