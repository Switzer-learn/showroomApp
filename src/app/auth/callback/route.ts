import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    // Exchange code for session

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) throw sessionError;
    if (!session?.user) throw new Error("No user returned from Google OAuth");

    // Check if user exists in users table
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError && userError.code !== "PGRST116") {
      throw userError;
    }

    if (!existingUser) {
      // Create new user with no company assigned
      console.log(session, "Creating new user in users table");
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: session.user.id,
          email: session.user.email,
          nama: session.user.user_metadata.full_name || session.user.email,
          role: "member", // default role
          company_id: null, // must join later
          status: "active", // pending company join
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      // Send new user to join company page
      return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
    }

    // If user exists but no company assigned, send to join company page
    if (existingUser) {
      if (!existingUser.company_id) {
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
      }

      // If user is approved, go to dashboard
      if (existingUser.status === "active") {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      // Otherwise, show pending approval page
      return NextResponse.redirect(new URL("/auth/pending", requestUrl.origin));
    }
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
  }
}
