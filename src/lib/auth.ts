import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Find user with roles
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username,
              status: 'ACTIVE'
            },
            include: {
              userRoles: {
                include: {
                  role: true
                }
              }
            }
          });

          if (!user) {
            return null;
          }

          // Verify password
          const isValidPassword = await compare(credentials.password, user.passwordHash);
          if (!isValidPassword) {
            return null;
          }

          // Extract roles
          const roles = user.userRoles.map(ur => ur.role.name);

          // Check if user has admin/staff roles
          const allowedRoles = ['admin', 'manager', 'reviewer', 'staff'];
          const hasValidRole = roles.some(role => allowedRoles.includes(role));

          if (!hasValidRole) {
            return null;
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.fullName,
            roles: roles,
            image: null
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.roles = user.roles;
        token.username = user.username;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub;
        session.user.roles = token.roles as string[];
        session.user.username = token.username as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET
};