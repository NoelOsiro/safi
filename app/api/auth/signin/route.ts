import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { mockUsers } from '@/lib/mock-data';

export async function POST() {
  try {
    // Get the session - this will trigger the Azure AD sign-in flow if not authenticated
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Check if user exists in our database
    const existingUser = mockUsers.find(user => user.email === session.user?.email);

    if (!existingUser) {
      // User is authenticated with Azure AD but doesn't have an account yet
      return NextResponse.json(
        { 
          error: 'No account found',
          requiresSignup: true,
          email: session.user.email,
          name: session.user.name
        },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: existingUser,
    });
  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
