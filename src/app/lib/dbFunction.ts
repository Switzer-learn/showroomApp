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

export async function insertPenjualanMobil(
    carData: {
        id: string;
        harga_jual: number;
    },
    customerData: {
        nama: string;
        no_hp: string;
        alamat: string;
        jenis_kelamin: 'Laki-laki' | 'Perempuan';
    },
    paymentData: {
        metode_pembayaran: 'Tunai' | 'Kredit';
        uang_muka: number;
        nama_leasing: string;
        harga_kredit: number;
        dana_dari_leasing: number;
    }
) {
    const supabase = await createClientWithCookies();
    
    try {
        // Start a transaction
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .insert([{
                nama: customerData.nama,
                no_hp: customerData.no_hp,
                alamat: customerData.alamat,
                jenis_kelamin: customerData.jenis_kelamin
            }])
            .select()
            .single();

        if (customerError) throw customerError;

        // Insert penjualan data
        const { data: penjualan, error: penjualanError } = await supabase
            .from('penjualan')
            .insert([{
                mobil_id: carData.id,
                customer_id: customer.id,
                nama_pembeli: customerData.nama,
                alamat_pembeli: customerData.alamat,
                nomor_hp_pembeli: customerData.no_hp,
                metode_pembayaran: paymentData.metode_pembayaran,
                nama_leasing: paymentData.nama_leasing,
                uang_muka: paymentData.uang_muka,
                harga_kredit: paymentData.harga_kredit,
                dana_dari_leasing: paymentData.dana_dari_leasing,
                tanggal_jual: new Date().toISOString().split('T')[0],
                total_harga: carData.harga_jual
            }])
            .select()
            .single();

        if (penjualanError) throw penjualanError;

        // Update mobil status to 'Terjual'
        const { error: updateError } = await supabase
            .from('mobil')
            .update({ status: 'Terjual' })
            .eq('id', carData.id);

        if (updateError) throw updateError;

        return { success: true, data: { customer, penjualan } };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error };
    }
}

export async function getMonthlySalesData(timeFrame: 'week' | 'month' | 'year') {
    const supabase = await createClientWithCookies();
    
    // Get date range based on timeFrame
    const now = new Date();
    let startDate = new Date();
    if (timeFrame === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else if (timeFrame === 'month') {
        startDate.setMonth(now.getMonth() - 1);
    } else { // year
        startDate.setFullYear(now.getFullYear() - 1);
    }

    const { data, error } = await supabase
        .from('penjualan')
        .select(`
            tanggal_jual,
            mobil_id
        `)
        .gte('tanggal_jual', startDate.toISOString())
        .order('tanggal_jual', { ascending: true });

    if (error) {
        console.error('Error fetching monthly sales data:', error);
        throw error;
    }

    // Process data to get monthly counts
    const monthlySales = new Map();
    data?.forEach((sale: { tanggal_jual: string; mobil_id: string }) => {
        const date = new Date(sale.tanggal_jual);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlySales.has(monthKey)) {
            monthlySales.set(monthKey, 0);
        }
        monthlySales.set(monthKey, monthlySales.get(monthKey) + 1);
    });

    return Array.from(monthlySales.entries()).map(([month, count]) => ({
        month,
        count
    }));
}

interface AnalyticsData {
    summary: {
        total_revenue: number;
        total_cost: number;
        profit: number;
        profit_margin: number;
    };
    sales_by_month: Array<{
        month: string;
        count: number;
        total: number;
    }>;
    top_5_best_sellers: Array<{
        merk: string;
        series: string;
        units_sold: number;
    }>;
    avg_days_to_sell: number;
    unsold_over_90_days: Array<{
        id: string;
        merk: string;
        series: string;
        age: number;
    }>;
}

export async function getAnalyticsData(): Promise<AnalyticsData | null> {
    const supabase = await createClientWithCookies();
    
    try {
        const { data, error } = await supabase
            .rpc('analytics');
        console.log(data)
        if (error) {
            console.error('Error fetching analytics data:', error);
            return null;
        }

        return JSON.parse(data);
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

interface PendingUser {
    id: string;
    email: string;
    nama: string | null;
    no_hp: string | null;
    approved: boolean;
    level: 'admin' | 'sales' | null;
    created_at: string;
}

interface User {
    id: string;
    email: string;
    nama: string | null;
    no_hp: string | null;
    approved: boolean;
    level: 'admin' | 'sales';
    created_at: string;
}

interface RegisterUserParams {
  email: string
  nama?: string
  no_hp?: string
}

export async function registerUser(params: RegisterUserParams): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClientWithCookies()
  
  try {
    // Get the user ID from auth.users
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'User not found in auth' }
    }

    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      return { success: false, error: 'User already exists' }
    }

    // Check if user already exists in pending_users table
    const { data: existingPendingUser } = await supabase
      .from('pending_users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingPendingUser) {
      return { success: false, error: 'User already pending approval' }
    }

    // Insert into pending_users table
    const { error: insertError } = await supabase
      .from('pending_users')
      .insert({
        id: user.id,
        email: params.email,
        nama: params.nama,
        no_hp: params.no_hp,
        approved: false,
        level: 'sales' // Default level for new users
      })

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPendingUsers(): Promise<PendingUser[]> {
    const supabase = await createClientWithCookies();
    
    try {
        const { data, error } = await supabase
            .from('pending_users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching pending users:', error);
        return [];
    }
}

export async function approveUser(userId: string, level: 'admin' | 'sales'): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClientWithCookies();
    
    try {
        // Get pending user data
        const { data: pendingUser, error: fetchError } = await supabase
            .from('pending_users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError || !pendingUser) {
            return { success: false, error: 'Pending user not found' };
        }

        // Insert into users table
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: pendingUser.id,
                email: pendingUser.email,
                nama: pendingUser.nama,
                no_hp: pendingUser.no_hp,
                level: level
            });

        if (insertError) {
            return { success: false, error: insertError.message };
        }

        // Delete from pending_users
        const { error: deleteError } = await supabase
            .from('pending_users')
            .delete()
            .eq('id', userId);

        if (deleteError) {
            return { success: false, error: deleteError.message };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function getUserLevel(userId: string): Promise<'admin' | 'sales' | null> {
    const supabase = await createClientWithCookies();
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('level')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data?.level || null;
    } catch (error) {
        console.error('Error getting user level:', error);
        return null;
    }
}

export async function deleteCarById(carId: string): Promise<{ success: boolean; error?: any }> {
    const supabase = await createClientWithCookies();
    try {
        // First check if the car exists and is not sold
        const { data: car, error: fetchError } = await supabase
            .from('mobil')
            .select('status')
            .eq('id', carId)
            .single();

        if (fetchError) {
            return { success: false, error: 'Car not found' };
        }

        if (car.status === 'Terjual') {
            return { success: false, error: 'Cannot delete a sold car' };
        }

        // Delete the car
        const { error: deleteError } = await supabase
            .from('mobil')
            .delete()
            .eq('id', carId);

        if (deleteError) {
            return { success: false, error: deleteError };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting car:', error);
        return { success: false, error };
    }
}