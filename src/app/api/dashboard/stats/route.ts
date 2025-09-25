import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get basic statistics
    const [
      totalApplications,
      applicationsToday,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalUsers,
      totalDocuments
    ] = await Promise.all([
      // Total applications
      prisma.application.count(),

      // Applications submitted today
      prisma.application.count({
        where: {
          submittedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),

      // Pending applications
      prisma.application.count({
        where: {
          status: 'SUBMITTED'
        }
      }),

      // Approved applications
      prisma.application.count({
        where: {
          status: 'APPROVED'
        }
      }),

      // Rejected applications
      prisma.application.count({
        where: {
          status: 'REJECTED'
        }
      }),

      // Total users (excluding system user)
      prisma.user.count({
        where: {
          NOT: {
            username: 'system'
          }
        }
      }),

      // Total documents uploaded
      prisma.document.count()
    ]);

    // Get recent applications
    const recentApplications = await prisma.application.findMany({
      take: 5,
      orderBy: {
        submittedAt: 'desc'
      },
      select: {
        id: true,
        trackingNumber: true,
        title: true,
        status: true,
        submittedAt: true,
        contactPerson: true,
        institutionName: true,
        cooperationType: {
          select: {
            name: true
          }
        }
      }
    });

    // Calculate trends (compare with last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      lastMonthApplications,
      lastMonthApproved
    ] = await Promise.all([
      prisma.application.count({
        where: {
          submittedAt: {
            gte: lastMonth,
            lt: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),

      prisma.application.count({
        where: {
          status: 'APPROVED',
          updatedAt: {
            gte: lastMonth,
            lt: new Date()
          }
        }
      })
    ]);

    // Calculate trends
    const applicationTrend = lastMonthApplications > 0
      ? Math.round(((applicationsToday - lastMonthApplications) / lastMonthApplications) * 100)
      : 0;

    const approvedTrend = lastMonthApproved > 0
      ? Math.round(((approvedApplications - lastMonthApproved) / lastMonthApproved) * 100)
      : 0;

    return NextResponse.json({
      stats: {
        totalApplications,
        applicationsToday,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalUsers,
        totalDocuments,
        trends: {
          applications: applicationTrend,
          approved: approvedTrend
        }
      },
      recentApplications
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}