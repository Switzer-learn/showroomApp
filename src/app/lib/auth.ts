import { createClient } from "../utils/supabase/client";


export type AuthError = { message: string };

export async function signInWithGoogle(redirectTo: string = "/dashboard") {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw error;
    console.log("Google sign in data:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("Google sign in error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to sign in with Google" },
    };
  }
}

export async function signOut() {
  const supabase = createClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Sign out error:", error);
    return { error: { message: error.message || "Failed to sign out" } };
  }
}

export async function getCurrentUser() {
  const supabase = createClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error: any) {
    console.error("Get user error:", error);
    return {
      user: null,
      error: { message: error.message || "Failed to get current user" },
    };
  }
}

export async function getUserSession() {
  const supabase = createClient();
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error: any) {
    console.error("Get session error:", error);
    return {
      session: null,
      error: { message: error.message || "Failed to get user session" },
    };
  }
}

export async function isUserApproved() {
  const supabase = createClient();
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error("No user found");

    // Check if user exists in users table
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("approved, level")
      .eq("id", user.id)
      .single();

    if (userDataError) {
      return { 
        isApproved: false, 
        level: null,
        error: { message: "User not found in database" }
      };
    }

    return { 
      isApproved: userData?.approved || false, 
      level: userData?.level || null,
      error: null 
    };
  } catch (error: any) {
    console.error("Check user approval error:", error);
    return {
      isApproved: false,
      level: null,
      error: {
        message: error.message || "Failed to check user approval status",
      },
    };
  }
}
