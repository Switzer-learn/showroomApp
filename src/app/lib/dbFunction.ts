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
