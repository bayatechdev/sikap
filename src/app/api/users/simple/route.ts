import { NextRequest, NextResponse } from 'next/server';

// Mock users data untuk testing User Management
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active' as const,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: '2024-01-15T10:30:00.000Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'manager',
    status: 'active' as const,
    createdAt: '2024-01-02T00:00:00.000Z',
    lastLogin: '2024-01-14T09:15:00.000Z'
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'reviewer',
    status: 'inactive' as const,
    createdAt: '2024-01-03T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'staff',
    status: 'active' as const,
    createdAt: '2024-01-04T00:00:00.000Z',
    lastLogin: '2024-01-13T14:20:00.000Z'
  }
];

export async function GET() {
  return NextResponse.json({
    users: mockUsers,
    message: 'Users fetched successfully'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, status } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailExists = mockUsers.find(user => user.email === email);
    if (emailExists) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      name,
      email,
      role,
      status: status || 'active' as const,
      createdAt: new Date().toISOString(),
      lastLogin: undefined
    };

    mockUsers.push(newUser);

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