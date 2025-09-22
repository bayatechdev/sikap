import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.cooperationCategory.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching cooperation categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cooperation categories' },
      { status: 500 }
    );
  }
}