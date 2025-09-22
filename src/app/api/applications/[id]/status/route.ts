import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const applicationId = params.id;
    const body = await request.json();
    const { status, notes } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current application
    const currentApplication = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { status: true },
    });

    if (!currentApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application status and create history record
    const result = await prisma.$transaction(async (tx) => {
      // Update application
      const updatedApplication = await tx.application.update({
        where: { id: applicationId },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      // Create status history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          previousStatus: currentApplication.status,
          newStatus: status,
          notes: notes || null,
          notifyApplicant: true,
        },
      });

      // Create email notification
      const application = await tx.application.findUnique({
        where: { id: applicationId },
        select: {
          trackingNumber: true,
          contactEmail: true,
          title: true,
        },
      });

      if (application) {
        const statusMessages = {
          SUBMITTED: 'Your application has been received and is being processed.',
          IN_REVIEW: 'Your application is currently under review.',
          APPROVED: 'Congratulations! Your application has been approved.',
          REJECTED: 'Unfortunately, your application has been rejected.',
        };

        await tx.emailNotification.create({
          data: {
            applicationId,
            recipientEmail: application.contactEmail,
            subject: `[SIKAP] Status Update - ${application.trackingNumber}`,
            message: `Status Update for ${application.title}:\n\n${statusMessages[status as keyof typeof statusMessages]}\n\n${notes ? `Notes: ${notes}\n\n` : ''}Track your application: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${application.trackingNumber}`,
            notificationType: 'STATUS_CHANGE',
          },
        });
      }

      return updatedApplication;
    });

    return NextResponse.json({
      success: true,
      application: result,
      message: 'Application status updated successfully',
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}