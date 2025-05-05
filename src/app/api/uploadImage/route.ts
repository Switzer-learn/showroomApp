import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const carId = formData.get('carId') as string;
    
    if (!image || !carId) {
      return NextResponse.json(
        { error: 'Image and carId are required' },
        { status: 400 }
      );
    }
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('car-images')
      .upload(`car-${carId}-${Date.now()}`, image);
    
    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('car-images')
      .getPublicUrl(uploadData.path);
    
    // Update car record with new image URL
    const { data, error } = await supabase
      .from('mobil')
      .update({ image_url: urlData.publicUrl })
      .eq('id', carId)
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      car: data[0] 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}