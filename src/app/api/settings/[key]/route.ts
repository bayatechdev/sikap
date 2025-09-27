import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSettingSchema = z.object({
  value: z.string(),
  description: z.string().optional(),
  type: z.string().optional(),
});

// GET /api/settings/[key] - Get specific setting by key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    const setting = await prisma.setting.findUnique({
      where: { key },
      select: {
        id: true,
        key: true,
        value: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    // Parse JSON values for JSON type settings
    const processedSetting = {
      ...setting,
      value: setting.type === 'json' ? JSON.parse(setting.value) : setting.value,
    };

    return NextResponse.json(processedSetting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setting' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/[key] - Update setting by key (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Check authentication (admin only)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await params;
    const body = await request.json();
    const validatedData = updateSettingSchema.parse(body);

    // Check if setting exists
    const existingSetting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    // Convert value to string if it's JSON type
    const updateData = {
      value: validatedData.type === 'json' || existingSetting.type === 'json'
        ? JSON.stringify(validatedData.value)
        : validatedData.value,
      description: validatedData.description,
      type: validatedData.type || existingSetting.type,
    };

    const updatedSetting = await prisma.setting.update({
      where: { key },
      data: updateData,
    });

    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error('Error updating setting:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/[key] - Delete setting by key (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Check authentication (admin only)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await params;

    // Check if setting exists
    const existingSetting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    await prisma.setting.delete({
      where: { key },
    });

    return NextResponse.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}