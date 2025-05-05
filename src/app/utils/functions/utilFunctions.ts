import { createClientWithCookies } from "@/app/lib/dbFunction";
export async function handleSignOut() {
  const supabase = await createClientWithCookies();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    return false;
  }
  
}
