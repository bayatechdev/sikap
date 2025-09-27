import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSettingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string(),
  description: z.string().optional(),
  type: z.string().default('text'),
});

const querySchema = z.object({
  keys: z.string().optional(), // Comma-separated keys
  type: z.string().optional(),
  search: z.string().optional(),
});

// GET /api/settings - Get all settings or specific keys
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const { keys, type, search } = querySchema.parse(queryData);

    // Build where conditions
    const where: Record<string, unknown> = {};

    if (keys) {
      const keyArray = keys.split(',').map(k => k.trim());
      where.key = { in: keyArray };
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const settings = await prisma.setting.findMany({
      where,
      select: {
        id: true,
        key: true,
        value: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        key: 'asc',
      },
    });

    // Parse JSON values for JSON type settings
    const processedSettings = settings.map(setting => ({
      ...setting,
      value: setting.type === 'json' ? JSON.parse(setting.value) : setting.value,
    }));

    return NextResponse.json({
      settings: processedSettings,
      count: settings.length,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/settings - Create new setting (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication (admin only)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSettingSchema.parse(body);

    // Convert value to string if it's JSON type
    const settingData = {
      ...validatedData,
      value: validatedData.type === 'json' ? JSON.stringify(validatedData.value) : validatedData.value,
    };

    const setting = await prisma.setting.create({
      data: settingData,
    });

    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Setting key already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create setting' },
      { status: 500 }
    );
  }
}