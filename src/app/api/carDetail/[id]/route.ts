import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('mobil')
      .update(body)
      .eq('id', context.params.id)
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}