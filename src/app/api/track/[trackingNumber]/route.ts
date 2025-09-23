import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface StatusHistory {
  newStatus: string;
  previousStatus: string | null;
  notes: string | null;
  changedAt: Date;
  changedByUser: {
    fullName: string;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const resolvedParams = await params;
    const { trackingNumber } = resolvedParams;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Find application with public submission data
    const application = await prisma.application.findUnique({
      where: { trackingNumber },
      include: {
        applicationType: {
          select: { name: true, code: true }
        },
        institution: {
          select: { name: true, type: true }
        },
        cooperationCategory: {
          select: { name: true }
        },
        publicSubmission: {
          select: {
            trackingNumber: true,
            contactEmail: true,
            contactPerson: true
          }
        },
        statusHistory: {
          include: {
            changedByUser: {
              select: { fullName: true }
            }
          },
          orderBy: { changedAt: 'desc' }
        },
        documents: {
          select: {
            id: true,
            originalFilename: true,
            documentType: true,
            fileSize: true,
            uploadedAt: true
          },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found with this tracking number' },
        { status: 404 }
      );
    }

    // Only return data for public submissions
    if (!application.isPublicSubmission) {
      return NextResponse.json(
        { error: 'This tracking number is not accessible publicly' },
        { status: 403 }
      );
    }

    // Format response data
    const response = {
      trackingNumber: application.trackingNumber,
      title: application.title,
      status: application.status,
      submittedAt: application.submittedAt,
      updatedAt: application.updatedAt,
      applicationType: application.applicationType,
      institution: application.institution,
      cooperationCategory: application.cooperationCategory,
      contact: {
        person: application.publicSubmission?.contactPerson,
        email: application.publicSubmission?.contactEmail
      },
      statusHistory: application.statusHistory.map(history => ({
        status: history.newStatus,
        previousStatus: history.previousStatus,
        notes: history.notes,
        changedAt: history.changedAt,
        changedBy: history.changedByUser?.fullName || 'System'
      })),
      documents: application.documents.map(doc => ({
        id: doc.id,
        filename: doc.originalFilename,
        type: doc.documentType,
        size: doc.fileSize,
        uploadedAt: doc.uploadedAt
      })),
      timeline: generateTimeline(application.status, application.statusHistory)
    };

    return NextResponse.json({
      success: true,
      application: response
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application data' },
      { status: 500 }
    );
  }
}

// Helper function to generate timeline for better UX
function generateTimeline(currentStatus: string, statusHistory: StatusHistory[]) {
  const statusFlow = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'ADDITIONAL_INFO_REQUIRED',
    'APPROVED',
    'REJECTED'
  ];

  const timeline = statusFlow.map(status => {
    const historyEntry = statusHistory.find(h => h.newStatus === status);
    return {
      status,
      label: getStatusLabel(status),
      completed: historyEntry !== undefined,
      date: historyEntry?.changedAt || null,
      notes: historyEntry?.notes || null,
      isCurrent: status === currentStatus
    };
  });

  return timeline;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'SUBMITTED': 'Permohonan Diterima',
    'UNDER_REVIEW': 'Sedang Direview',
    'ADDITIONAL_INFO_REQUIRED': 'Butuh Informasi Tambahan',
    'APPROVED': 'Disetujui',
    'REJECTED': 'Ditolak'
  };
  return labels[status] || status;
}