import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const publicRoutes = ["/login", "/auth/callback"];

  // 1. No active user → allow only public routes
  if (!user) {
    if (!publicRoutes.includes(path)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return res;
  }

  // 2. User logged in — fetch access info
  const { data: accessInfo, error: accessError } = await supabase.rpc("get_user_access_info");

  if (accessError || !accessInfo) {
    // If error fetching access info, force logout to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { company_id, role, is_system_admin, is_active } = accessInfo;

  // 2. If user has no company_id and is not system admin → only access onboarding
  if (!company_id && !is_system_admin) {
    if (path !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return res;
  }

  // 3. User has company_id, check if active
  if (company_id && !is_system_admin) {
    if (!is_active) {
      if (path !== "/pending") {
        return NextResponse.redirect(new URL("/pending", request.url));
      }
      return res;
    }
  }

  // 4. All checks passed, user should access dashboard or allowed routes
  if (path === "/" || path === "/login" || path === "/onboarding" || path === "/pending") {
    // Redirect logged in user to dashboard from root/login/onboarding/pending
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
