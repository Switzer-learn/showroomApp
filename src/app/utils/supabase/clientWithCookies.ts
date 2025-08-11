import { cookies } from 'next/headers';
import { createClient } from "@/app/utils/supabase/server";

export async function createClientWithCookies() {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    return supabase;
}