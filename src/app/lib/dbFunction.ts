"use server"
import { cookies } from 'next/headers';
import { createClient } from '../utils/supabase/server';

export async function getAllCarDetail() {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data, error } = await supabase
        .from('mobil')
        .select('*')

    if(error){
        return null;
    }
    return data;
}


export async function createClientWithCookies() {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    return supabase;
}

export async function insertCarData(formData: any, imageFile: File | null) {
    
    const supabase = await createClientWithCookies();
    console.log(formData)
    try {
        let imageUrl = null;
        
        // Upload image if exists
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('gambar-mobil')
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('gambar-mobil')
                .getPublicUrl(fileName);
                
            imageUrl = publicUrl;
        }

        // Insert car data
        const { data, error } = await supabase
            .from('mobil')
            .insert([{
                ...formData,
                image_url: imageUrl
            }])
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error };
    }
}