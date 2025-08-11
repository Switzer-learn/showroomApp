"use server"
import { cookies } from 'next/headers';
import { createClient } from '../utils/supabase/server';

/**
 * Helpers
 */
async function withCompanyScopedClient() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // Get session user to infer company scope if needed via RLS or profile
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * Inventory services
 */
export async function listCars() {
  const { supabase } = await withCompanyScopedClient();
  // Assuming RLS scopes by company_id automatically
  const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCar(payload: any) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.from('cars').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateCar(id: string, patch: any) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.from('cars').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteCar(id: string) {
  const { supabase } = await withCompanyScopedClient();
  const { error } = await supabase.from('cars').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
}

export async function uploadAttachment(file: File, path: string) {
  const { supabase } = await withCompanyScopedClient();
  // Upload to existing bucket "gambar-mobil"
  const { data, error } = await supabase.storage.from('gambar-mobil').upload(path, file, {
    upsert: false,
    cacheControl: '3600',
  });
  if (error) throw error;
  return data;
}

/**
 * Sales services
 */
export async function createCustomer(payload: {
  nama: string;
  no_hp?: string;
  alamat?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
}) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.from('customers').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function createSale(payload: {
  company_id?: string;
  car_id: string;
  customer_id: string;
  sale_price: number;
  payment_method: string;
  sale_date: string;
  salesperson_id?: string;
}) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.from('sales').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function listSales(params?: { startDate?: string; endDate?: string }) {
  const { supabase } = await withCompanyScopedClient();
  let query = supabase.from('sales').select('*').order('sale_date', { ascending: false });
  if (params?.startDate) query = query.gte('sale_date', params.startDate);
  if (params?.endDate) query = query.lte('sale_date', params.endDate);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Purchases services
 */
export async function createPurchase(payload: {
  company_id?: string;
  car_id: string;
  buy_price: number;
  payment_method: string;
  purchase_date: string;
  vendor_source?: string;
}) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.from('purchases').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function listPurchases(params?: { startDate?: string; endDate?: string }) {
  const { supabase } = await withCompanyScopedClient();
  let query = supabase.from('purchases').select('*').order('purchase_date', { ascending: false });
  if (params?.startDate) query = query.gte('purchase_date', params.startDate);
  if (params?.endDate) query = query.lte('purchase_date', params.endDate);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Accounting services
 */
export async function getJournal(params: { startDate: string; endDate: string }) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase
    .from('v_journal_entries')
    .select('*')
    .gte('transaction_date', params.startDate)
    .lte('transaction_date', params.endDate)
    .order('transaction_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getLedger(params: { startDate: string; endDate: string }) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase
    .from('v_ledger_entries')
    .select('*')
    .gte('transaction_date', params.startDate)
    .lte('transaction_date', params.endDate)
    .order('account_code', { ascending: true })
    .order('transaction_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getProfitAndLoss(params: { startDate: string; endDate: string }) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.rpc('fn_pnl_mtd', {
    start_date: params.startDate,
    end_date: params.endDate,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getBalanceSheet(params: { endDate: string }) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.rpc('fn_balance_sheet_latest', {
    end_date: params.endDate,
  });
  if (error) throw error;
  return data ?? [];
}

/**
 * Analytics services
 */
export async function getUpcomingSTNKExpirations() {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.from('upcoming_stnk_expirations').select('*').order('expires_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function salesTrends(params: { timeFrame: 'week' | 'month' | 'year' }) {
  // Keep existing getMonthlySalesData for now; alias to new name
  return await getMonthlySalesData(params.timeFrame);
}

export async function avgDaysToSell() {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.rpc('fn_avg_days_to_sell');
  if (error) throw error;
  return data ?? 0;
}

/**
 * Storage helpers for public URL and setting image on records
 */
export async function storagePublicUrl(path: string): Promise<string> {
  const { supabase } = await withCompanyScopedClient();
  const { data } = supabase.storage.from('gambar-mobil').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Set image_url for new cars schema
 */
export async function setCarImageUrl(carId: string, publicUrl: string) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.from('cars').update({ image_url: publicUrl }).eq('id', carId).select('*').single();
  if (error) throw error;
  return data;
}

/**
 * Legacy: Set image_url for mobil table (kept for compatibility)
 */
export async function setMobilImageUrl(mobilId: string, publicUrl: string) {
  const { supabase } = await withCompanyScopedClient();
  const { data, error } = await supabase.from('mobil').update({ image_url: publicUrl }).eq('id', mobilId).select('*').single();
  if (error) throw error;
  return data;
}


export async function createClientWithCookies() {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    return supabase;
}

/**
 * Legacy insert (mobil) retained to avoid breaking current flows.
 * Prefer createCar + uploadAttachment going forward.
 */
export async function insertCarData(formData: any, imageFile: File | null) {
    const supabase = await createClientWithCookies();
    try {
        const { data: insertedData, error: insertError } = await supabase
            .from('mobil')
            .insert([{ ...formData, image_url: null }])
            .select()
            .single();
        if (insertError) throw insertError;

        let imageUrl: string | null = null;
        if (imageFile && insertedData?.id) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${insertedData.id}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('gambar-mobil')
                .upload(fileName, imageFile);
            if (uploadError) {
                await supabase.from('mobil').delete().eq('id', insertedData.id);
                throw uploadError;
            }
            const { data: { publicUrl } } = supabase.storage.from('gambar-mobil').getPublicUrl(fileName);
            imageUrl = publicUrl;
            const { error: updateError } = await supabase.from('mobil').update({ image_url: imageUrl }).eq('id', insertedData.id);
            if (updateError) throw updateError;
        }
        return { success: true, data: insertedData };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error };
    }
}

/**
 * Legacy penjualan flow retained; to be replaced by createSale and DB triggers.
 */
export async function insertPenjualanMobil(
    carData: { id: string; harga_jual: number; },
    customerData: { nama: string; no_hp: string; alamat: string; jenis_kelamin: 'Laki-laki' | 'Perempuan'; },
    paymentData: { metode_pembayaran: 'Tunai' | 'Kredit'; uang_muka: number; nama_leasing: string; harga_kredit: number; dana_dari_leasing: number; }
) {
    const supabase = await createClientWithCookies();
    try {
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

        const { error: updateError } = await supabase.from('mobil').update({ status: 'Terjual' }).eq('id', carData.id);
        if (updateError) throw updateError;

        return { success: true, data: { customer, penjualan } };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error };
    }
}

export async function getMonthlySalesData(timeFrame: 'week' | 'month' | 'year') {
    const supabase = await createClientWithCookies();
    const now = new Date();
    let startDate = new Date();
    if (timeFrame === 'week') startDate.setDate(now.getDate() - 7);
    else if (timeFrame === 'month') startDate.setMonth(now.getMonth() - 1);
    else startDate.setFullYear(now.getFullYear() - 1);

    const { data, error } = await supabase
        .from('sales')
        .select(`sale_date, car_id`)
        .gte('sale_date', startDate.toISOString())
        .order('sale_date', { ascending: true });
    if (error) {
        console.error('Error fetching monthly sales data:', error);
        throw error;
    }

    const monthlySales = new Map<string, number>();
    data?.forEach((sale: { sale_date: string; car_id: string }) => {
        const date = new Date(sale.sale_date);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlySales.set(monthKey, (monthlySales.get(monthKey) ?? 0) + 1);
    });

    return Array.from(monthlySales.entries()).map(([month, count]) => ({ month, count }));
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
        const { data, error } = await supabase.rpc('analytics');
        if (error) {
            console.error('Error fetching analytics data:', error);
            return null;
        }
        // Ensure data is JSON object or stringified
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        return parsed as AnalyticsData;
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