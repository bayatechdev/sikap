import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch users dengan roles
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data untuk sesuai dengan interface UI
    const transformedUsers = users.map(user => {
      const roles = user.userRoles.map(ur => ur.role.name);
      const primaryRole = roles[0] || 'staff'; // ambil role pertama sebagai primary

      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: primaryRole.toLowerCase(),
        status: user.status === 'ACTIVE' ? 'active' : 'inactive' as const,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.updatedAt.toISOString() // use updatedAt as proxy for lastLogin
      };
    });

    return NextResponse.json({
      users: transformedUsers,
      message: 'Users fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, status } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if username (same as email) already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: email }
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get or create role
    let roleRecord = await prisma.role.findUnique({
      where: { name: role.toLowerCase() }
    });

    if (!roleRecord) {
      // Create role if it doesn't exist
      roleRecord = await prisma.role.create({
        data: {
          name: role.toLowerCase(),
          description: `${role} role`,
          permissionsJson: {}
        }
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username: email, // use email as username
        passwordHash: hashedPassword,
        fullName: name,
        status: status === 'active' ? 'ACTIVE' : 'INACTIVE'
      }
    });

    // Assign role to user
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleRecord.id,
        assignedBy: session.user.id || 'system'
      }
    });

    // Return created user with role info
    const newUser = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: role.toLowerCase(),
      status: user.status === 'ACTIVE' ? 'active' : 'inactive' as const,
      createdAt: user.createdAt.toISOString()
    };

    return NextResponse.json({
      user: newUser,
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}