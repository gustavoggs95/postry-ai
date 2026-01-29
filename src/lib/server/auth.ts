import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

export async function getAuthUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
    ...user.user_metadata,
  };
}

export function unauthorizedResponse() {
  return Response.json(
    {
      error: 'Unauthorized',
      message: 'Authentication required',
    },
    { status: 401 }
  );
}
