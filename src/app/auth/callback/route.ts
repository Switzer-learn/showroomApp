import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  console.log(code,next)
  if (code) {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    try {
      // Exchange the code for a session
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      console.log("authcallback",session);
      if (sessionError) throw sessionError

      if (session?.user) {
        console.log("user exist in callback not in users table")
        // Check if user already exists in users table
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw userError
        }

        if (!existingUser) {
          console.log("creating new user")
          // Insert new user into users table
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                nama: session.user.user_metadata?.full_name || null,
                no_hp: session.user.user_metadata?.phone || null,
                approved: false, // Default to false, admin needs to approve
                level: 'sales', // Default to sales, admin can change to admin
                created_at: new Date().toISOString()
              }
            ])
            
          if (insertError) throw insertError
        }else{
          console.log("user exist")
        }

        // Redirect to dashboard
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/pending', requestUrl.origin))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/pending', requestUrl.origin))
}