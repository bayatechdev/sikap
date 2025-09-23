import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin or manager role, or is accessing their own data
    const hasAdminRole = session.user.roles?.some(role => ['admin', 'manager'].includes(role));
    if (!hasAdminRole && session.user.id !== resolvedParams.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user,
      message: 'User fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, status, password } = body;

    // Check permissions
    const isOwnProfile = session.user.id === resolvedParams.id;
    const isAdmin = session.user.roles?.[0] === 'admin';
    const isManager = session.user.roles?.[0] === 'manager';

    if (!isAdmin && !isManager && !isOwnProfile) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Additional permission checks for sensitive operations
    if (!isAdmin && (role || status)) {
      return NextResponse.json(
        { error: 'Only administrators can change role or status' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'manager', 'reviewer', 'staff'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email is already taken by another user' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      fullName: string;
      email: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
      passwordHash?: string;
    } = {
      fullName: name,
      email
    };

    // Only admins can update status
    if (isAdmin && status !== undefined) {
      // Map frontend status values to database enum values
      const statusMap: Record<string, 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED'> = {
        'active': 'ACTIVE',
        'inactive': 'INACTIVE',
        'pending': 'PENDING_VERIFICATION',
        'suspended': 'SUSPENDED'
      };
      updateData.status = statusMap[status.toLowerCase()] || 'ACTIVE';
    }

    // Handle password update
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete users
    if (session.user.roles?.[0] !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Prevent self-deletion
    if (session.user.id === resolvedParams.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has any related data that needs to be handled
    const userApplications = await prisma.application.count({
      where: {
        OR: [
          { contactEmail: existingUser.email },
          { userId: resolvedParams.id }
        ]
      }
    });

    if (userApplications > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing applications. Please reassign or remove applications first.' },
        { status: 400 }
      );
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}