import { createAdminClient } from "@/lib/server/appwrite";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import authService from '@/lib/services/auth.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');
  const redirect = searchParams.get('redirect') || '/';

  if (!userId || !secret) {
    console.error('Missing required parameters for OAuth callback');
    return NextResponse.redirect(
      new URL(`/login?error=invalid_callback&redirect=${encodeURIComponent(redirect)}`, request.url)
    );
  }

  try {
    const { account } = await createAdminClient();
    const session = await account.createSession(userId, secret);

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.toLowerCase()}_legacy`,session.secret,{
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Redirect to the original URL or home page
    return NextResponse.redirect(new URL(redirect, request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=auth_failed&redirect=${encodeURIComponent(redirect)}`, request.url)
    );
  }
}
