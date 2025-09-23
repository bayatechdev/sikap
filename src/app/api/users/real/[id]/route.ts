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

    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform data untuk sesuai dengan interface UI
    const roles = user.userRoles.map(ur => ur.role.name);
    const primaryRole = roles[0] || 'staff';

    const transformedUser = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: primaryRole.toLowerCase(),
      status: user.status === 'ACTIVE' ? 'active' : 'inactive' as const,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString()
    };

    return NextResponse.json({
      user: transformedUser,
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
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
      username?: string;
      passwordHash?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    } = {
      fullName: name,
      email
    };

    // Update username if email changed
    if (email !== existingUser.email) {
      updateData.username = email;
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

    // Handle status update
    if (status !== undefined) {
      updateData.status = status === 'active' ? 'ACTIVE' : 'INACTIVE';
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData
    });

    // Handle role update if provided
    if (role) {
      const validRoles = ['admin', 'manager', 'reviewer', 'staff'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
      }

      // Get or create role
      let roleRecord = await prisma.role.findUnique({
        where: { name: role.toLowerCase() }
      });

      if (!roleRecord) {
        roleRecord = await prisma.role.create({
          data: {
            name: role.toLowerCase(),
            description: `${role} role`,
            permissionsJson: {}
          }
        });
      }

      // Remove existing roles
      await prisma.userRole.deleteMany({
        where: { userId: resolvedParams.id }
      });

      // Assign new role
      await prisma.userRole.create({
        data: {
          userId: resolvedParams.id,
          roleId: roleRecord.id,
          assignedBy: session.user.id || 'system'
        }
      });
    }

    // Return updated user data
    const finalUser = {
      id: updatedUser.id,
      name: updatedUser.fullName,
      email: updatedUser.email,
      role: role ? role.toLowerCase() : existingUser.userRoles[0]?.role.name || 'staff',
      status: updatedUser.status === 'ACTIVE' ? 'active' : 'inactive' as const,
      createdAt: updatedUser.createdAt.toISOString(),
      lastLogin: updatedUser.updatedAt.toISOString()
    };

    return NextResponse.json({
      user: finalUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);

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
          { userId: resolvedParams.id },
          { assignedTo: resolvedParams.id }
        ]
      }
    });

    if (userApplications > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing applications. Please reassign or remove applications first.' },
        { status: 400 }
      );
    }

    // Delete user (this will cascade delete userRoles due to schema)
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