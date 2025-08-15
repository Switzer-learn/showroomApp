import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';


const createCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyAddress: z.string().min(5, 'Company address must be at least 5 characters'),
  companyPhone: z.string().min(8, 'Company phone must be at least 8 digits'),
  companyEmail: z.email('Please enter a valid company email address'),
  companyLogo: z.string().optional().nullable(),
  website: z.url('Please enter a valid website URL').optional().or(z.literal('')),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/i).optional(),
  nama: z.string().min(2),
  email: z.email(),
  no_hp: z.string().min(8),
  primaryColor: z.string().default('#3B82F6'),
  secondaryColor: z.string().default('#6B7280'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Extract settings object from payload
    const settingsRaw = body.settings || {};
    // Prepare settings JSONB in correct structure
    const settings = {
      website: settingsRaw.website || null,
      slug: settingsRaw.slug || null,
      branding: {
        logo_url: settingsRaw.companyLogo || null,
        primary_color: settingsRaw.primaryColor || '#3B82F6',
        secondary_color: settingsRaw.secondaryColor || '#6B7280',
      }
    };

    // Validate input (flattened for zod)
    const validatedData = createCompanySchema.parse({
      companyName: body.name,
      companyAddress: body.address,
      companyPhone: body.phone_number,
      companyEmail: body.email,
      companyLogo: settingsRaw.companyLogo || null,
      website: settingsRaw.website || null,
      slug: settingsRaw.slug || null,
      nama: body.nama,
      email: body.user_email,
      no_hp: body.no_hp,
      primaryColor: settingsRaw.primaryColor || '#3B82F6',
      secondaryColor: settingsRaw.secondaryColor || '#6B7280',
    });

    // Insert company (only columns that exist in schema)
    const insertData: Record<string, any> = {
      name: validatedData.companyName,
      email: validatedData.companyEmail,
      phone_number: validatedData.companyPhone,
      address: validatedData.companyAddress,
      settings,
    };

    console.log('Inserting company with data:', insertData);
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert(insertData)
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }

    // Update user in users table with contact info and company assignment
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        company_id: company.id,
        nama: validatedData.nama,
        no_hp: validatedData.no_hp,
        email: validatedData.email,
        is_active: true,
        role: 'admin',
        status: 'active',
      })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error('Error updating user:', userUpdateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      companyId: company.id,
    });

  } catch (error) {
    console.error('Error in create-company API:', error);

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