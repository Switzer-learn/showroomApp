import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the current path
  const path = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/auth/callback'];
  if (publicRoutes.includes(path)) {
    return res;
  }

  // If no session and trying to access protected route, redirect to login
  if (!session) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check user approval status and company assignment
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('status, role, company_id')
    .eq('id', session.user.id)
    .single();

  if (userError || !userData) {
    // If user not found in users table, they're not authorized
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(redirectUrl);
  }

  // If user has no company assigned, redirect to onboarding
  if (!userData.company_id) {
    if (path !== '/onboarding') {
      const redirectUrl = new URL('/onboarding', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return res;
  }

  // If user is not active, redirect to pending
  if (userData.status !== 'active') {
    if (path !== '/auth/pending') {
      const redirectUrl = new URL('/auth/pending', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return res;
  }

  // Handle role-based access
  if (userData.role !== 'admin') {
    // Non-admin users can only access dashboard
    if (path !== '/dashboard') {
      const redirectUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 