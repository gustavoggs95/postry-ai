import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface AuthenticatedUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<{ user: AuthenticatedUser | null; error: string | null }> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: 'Missing or invalid authorization header',
      };
    }

    const token = authHeader.split(' ')[1];

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        error: 'Invalid or expired token',
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
        ...user.user_metadata,
      },
      error: null,
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      user: null,
      error: 'Authentication failed',
    };
  }
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    {
      error: 'Unauthorized',
      message,
    },
    { status: 401 }
  );
}
