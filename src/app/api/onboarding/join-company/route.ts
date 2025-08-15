import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const joinCompanySchema = z.object({
  companyId: z.string().min(5, 'Company ID must be at least 5 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyId } = joinCompanySchema.parse(body);

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('user_companies')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this company' },
        { status: 400 }
      );
    }

    // Create user-company relationship
    const { error: userCompanyError } = await supabase
      .from('user_companies')
      .insert({
        user_id: user.id,
        company_id: companyId,
        role: 'member',
        is_active: true,
      });

    if (userCompanyError) {
      console.error('Error creating user-company relationship:', userCompanyError);
      return NextResponse.json(
        { error: 'Failed to join company' },
        { status: 500 }
      );
    }

    // Update user's active company
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ active_company_id: companyId })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error('Error updating user active company:', userUpdateError);
    }

    return NextResponse.json({
      success: true,
      companyId: companyId,
      companyName: company.name,
    });

  } catch (error) {
    console.error('Error in join-company API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}