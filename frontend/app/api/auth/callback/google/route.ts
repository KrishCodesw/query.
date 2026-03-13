// app/api/auth/callback/google/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {prisma} from '@/lib/prismaClient';
import { AuthProvider } from '@/lib/generated/prisma/enums';
import { getSessionExpiry, COOKIE_NAME } from '@/lib/auth.utils';

// Type definition for Google's user info response
interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const redirectUri = `${appUrl}/api/auth/callback/google`;

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) {
      throw new Error(`Token exchange error: ${tokens.error_description}`);
    }

    // 2. Get user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    const userInfo: GoogleUserInfo = await userInfoResponse.json();
    const { id: googleId, email, name } = userInfo;

    // 3. Find or Create User (The core logic)
    let userId: string;

    // Try to find an existing GOOGLE account
    let account = await prisma.account.findUnique({
      where: {
        provider_provider_user_id: {
          provider: AuthProvider.GOOGLE,
          provider_user_id: googleId,
        },
      },
    });

    if (account) {
      // User and Account already exist
      userId = account.userId;
    } else {
      // No GOOGLE account found. Check if a User with this email already exists
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // No user with this email exists, create a new User and Account
        user = await prisma.user.create({
          data: {
            email: email,
            full_name: name,
            status: 'ACTIVE', // Google email is assumed verified
          },
        });
      }

      // At this point, 'user' is either the one we found or the one we just created
      // Now, create the new GOOGLE Account and link it
      await prisma.account.create({
        data: {
          userId: user.id,
          provider: AuthProvider.GOOGLE,
          providerId: email,
          provider_user_id: googleId,
        },
      });
      userId = user.id;
    }

    // 4. Create Session
    const expires_at = getSessionExpiry();
    const session = await prisma.session.create({
      data: {
        userId: userId,
        expires_at: expires_at,
      },
    });

    // 5. Set the session cookie
 cookies().set(COOKIE_NAME, session.id, {
  httpOnly: true,
  secure: true,
  expires: expires_at,
  path: '/',
  sameSite: 'lax',
});

    // 6. Redirect user to your app's dashboard
    return NextResponse.redirect(new URL('/', appUrl));
  } catch (error) {
    console.error('GOOGLE_CALLBACK_ERROR', error);
    return NextResponse.redirect(new URL('/auth/signin?error=oauth_failed', appUrl));
  }
}