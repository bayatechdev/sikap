import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTrackingNumber, generatePublicToken, validateEmail, validatePhone } from '@/lib/utils';
import type { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicationTypeCode,
      cooperationCategoryId,
      institutionId, // Optional - if selected from database
      institutionName, // Always required - either from DB or user input
      title,
      description,
      purpose,
      about,
      notes,
      contactPerson,
      contactEmail,
      contactPhone,
    } = body;

    // Validation
    if (!applicationTypeCode || !title || !description || !purpose || !about ||
        !contactPerson || !contactEmail || !contactPhone || !institutionName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!validateEmail(contactEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!validatePhone(contactPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone format' },
        { status: 400 }
      );
    }

    // Get application type
    const applicationType = await prisma.applicationType.findUnique({
      where: { code: applicationTypeCode },
    });

    if (!applicationType) {
      return NextResponse.json(
        { error: 'Invalid application type' },
        { status: 400 }
      );
    }

    // Generate tracking number and token
    let trackingNumber = generateTrackingNumber();
    let isUnique = false;
    let attempts = 0;

    // Ensure unique tracking number
    while (!isUnique && attempts < 10) {
      trackingNumber = generateTrackingNumber();
      const existing = await prisma.application.findUnique({
        where: { trackingNumber },
      });
      isUnique = !existing;
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique tracking number' },
        { status: 500 }
      );
    }

    const publicToken = generatePublicToken();

    // Create application with public submission
    const result = await prisma.$transaction(async (tx) => {
      // Create application
      const application = await tx.application.create({
        data: {
          applicationTypeId: applicationType.id,
          institutionId: institutionId || null,
          cooperationCategoryId: cooperationCategoryId || null,
          trackingNumber,
          publicToken,
          isPublicSubmission: true,
          title,
          description,
          purpose,
          about,
          notes: notes || null,
          contactPerson,
          contactEmail,
          contactPhone,
          institutionName,
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });

      // Create public submission record
      const publicSubmission = await tx.publicSubmission.create({
        data: {
          applicationId: application.id,
          trackingNumber,
          publicToken,
          contactEmail,
          contactPhone,
          contactPerson,
        },
      });

      // Create initial status history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          previousStatus: null,
          newStatus: 'SUBMITTED',
          notes: 'Application submitted via public form',
          notifyApplicant: true,
        },
      });

      // Create initial email notification
      await tx.emailNotification.create({
        data: {
          applicationId: application.id,
          recipientEmail: contactEmail,
          subject: `[SIKAP] Permohonan Diterima - ${trackingNumber}`,
          message: `Terima kasih! Permohonan Anda dengan nomor tracking ${trackingNumber} telah diterima dan sedang dalam proses review. Anda akan mendapat notifikasi update status selanjutnya melalui email ini.`,
          notificationType: 'SUBMISSION_CONFIRMATION',
        },
      });

      return { application, publicSubmission };
    });

    return NextResponse.json({
      success: true,
      trackingNumber,
      publicToken,
      applicationId: result.application.id,
      message: 'Application submitted successfully',
    });

  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {};

    if (status) {
      where.status = status.toUpperCase() as Prisma.EnumApplicationStatusFilter;
    }

    if (type) {
      where.applicationType = {
        code: type,
      };
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search } },
        { title: { contains: search } },
        { institutionName: { contains: search } },
        { contactEmail: { contains: search } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          applicationType: {
            select: { code: true, name: true },
          },
          institution: {
            select: { name: true, type: true },
          },
          cooperationCategory: {
            select: { name: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}