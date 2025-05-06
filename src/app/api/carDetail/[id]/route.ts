import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const body = await request.json();

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // Extract 'id' from the URL

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is missing' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('mobil')
      .update(body)
      .eq('id', id)
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
