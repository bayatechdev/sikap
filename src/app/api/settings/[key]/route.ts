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

// GET /api/settings/[key] - Get specific setting by key or bulk settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const { searchParams } = new URL(request.url);

    // If key is 'bulk' or contains query params, handle bulk request
    if (key === 'bulk' || searchParams.size > 0) {
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
    }

    // Handle individual setting request
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

// POST /api/settings/bulk - Create new setting (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    // Only allow POST to bulk endpoint for creating new settings
    if (key !== 'bulk') {
      return NextResponse.json(
        { error: 'POST method only available at /api/settings/bulk' },
        { status: 405 }
      );
    }

    // Check authentication (admin only)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle both single setting and bulk update
    if (Array.isArray(body)) {
      // Filter out any undefined or invalid entries
      const validSettings = body.filter(setting =>
        setting &&
        setting.key &&
        setting.value !== undefined &&
        setting.value !== null
      );

      if (validSettings.length === 0) {
        return NextResponse.json(
          { error: 'No valid settings provided' },
          { status: 400 }
        );
      }

      console.log('📝 Processing bulk settings update:', validSettings);

      const updatePromises = validSettings.map(async (settingData) => {
        try {
          const existingSetting = await prisma.setting.findUnique({
            where: { key: settingData.key },
          });

          if (!existingSetting) {
            // Create new setting
            const createData = {
              key: settingData.key,
              value: settingData.type === 'json' ? JSON.stringify(settingData.value) : settingData.value,
              description: settingData.description || '',
              type: settingData.type || 'text',
            };

            console.log('➕ Creating new setting:', createData);
            await prisma.setting.create({
              data: createData,
            });
          } else {
            // Update existing setting
            const updateData = {
              value: settingData.type === 'json' ? JSON.stringify(settingData.value) : settingData.value,
              description: settingData.description,
              type: settingData.type || existingSetting.type,
            };

            console.log('✏️ Updating existing setting:', settingData.key, updateData);
            await prisma.setting.update({
              where: { key: settingData.key },
              data: updateData,
            });
          }

          return { ok: true, key: settingData.key };
        } catch (error) {
          console.error(`❌ Failed to process setting ${settingData.key}:`, error);
          return { ok: false, key: settingData.key, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      const results = await Promise.all(updatePromises);
      const failedResults = results.filter(result => !result.ok);

      if (failedResults.length > 0) {
        console.error('❌ Some settings failed to update:', failedResults);
        return NextResponse.json({
          error: 'Failed to update some settings',
          details: failedResults
        }, { status: 500 });
      }

      console.log('✅ All settings updated successfully');
      return NextResponse.json({ message: 'Settings updated successfully' });
    } else {
      // Single setting creation
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
    }

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