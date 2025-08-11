import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OnboardingWizard from './components/OnboardingWizard';
import { Database } from '@/app/lib/database.types';

export default async function OnboardingPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if user has already completed onboarding
  const { data: user } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', session.user.id)
    .single();

  if (user?.company_id) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-base-200">
      <OnboardingWizard />
    </main>
  );
}