import { cookies } from 'next/headers';
import { createClient } from "@/app/utils/supabase/server";
import * as XLSX from 'xlsx';

// Database functions moved from dbFunction.ts
export async function createClientWithCookies() {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    return supabase;
}

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

export async function insertCarData(formData: any, imageFile: File | null) {
    const supabase = await createClientWithCookies();
    console.log(formData)
    try {
        // First, insert car data without image URL to get the ID
        const { data: insertedData, error: insertError } = await supabase
            .from('mobil')
            .insert([{
                ...formData,
                image_url: null // Will be updated after image upload
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        let imageUrl = null;
        
        // Upload image if exists, using the database ID as filename
        if (imageFile && insertedData?.id) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${insertedData.id}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('gambar-mobil')
                .upload(fileName, imageFile);

            if (uploadError) {
                // If image upload fails, we should delete the car record
                await supabase
                    .from('mobil')
                    .delete()
                    .eq('id', insertedData.id);
                throw uploadError;
            }
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('gambar-mobil')
                .getPublicUrl(fileName);
                
            imageUrl = publicUrl;

            // Update the car record with the image URL
            const { error: updateError } = await supabase
                .from('mobil')
                .update({ image_url: imageUrl })
                .eq('id', insertedData.id);

            if (updateError) throw updateError;
        }

        return { success: true, data: insertedData };
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

// Export functions from exportUtils.ts
interface PnLItem {
    type: 'income' | 'expense';
    account_name: string;
    group_name: string;
    income_amount?: number;
    expense_amount?: number;
    coa_code: string;
    transaction_date: string;
    net_amount?: number;
}

interface ExportLabaRugiParams {
    mtdData: PnLItem[];
    ytdData: PnLItem[];
    dateRange: { startDate: string; endDate: string };
}

export async function exportLabaRugiToExcel({ mtdData, ytdData, dateRange }: ExportLabaRugiParams) {
    // Helper: group by group_name and type
    function groupPnLByGroup(items: PnLItem[]): Record<string, { type: 'income' | 'expense'; accounts: { account_name: string; coa_code: string; net_amount: number }[] }> {
        const groups: Record<string, { type: 'income' | 'expense'; accounts: { account_name: string; coa_code: string; net_amount: number }[] }> = {};
        items.forEach((item: PnLItem) => {
            if (!groups[item.group_name]) {
                groups[item.group_name] = { type: item.type, accounts: [] };
            }
            groups[item.group_name].accounts.push({
                account_name: item.account_name,
                coa_code: item.coa_code,
                net_amount: item.net_amount || 0
            });
        });
        return groups;
    }

    const mtdGroups = groupPnLByGroup(mtdData || []);
    const ytdGroups = groupPnLByGroup(ytdData || []);

    // Get all group names in order (income first, then expense)
    const groupNames: string[] = [
        ...Object.keys(mtdGroups).filter(g => mtdGroups[g].type === 'income'),
        ...Object.keys(mtdGroups).filter(g => mtdGroups[g].type === 'expense')
    ];

    // Calculate totals
    let totalRevenueMTD = 0, totalRevenueYTD = 0;
    let totalExpenseMTD = 0, totalExpenseYTD = 0;

    // Prepare rows for Excel
    const rows: (string | number)[][] = [
        ['Description', 'MTD', 'MTD %', 'YTD', 'YTD %']
    ];

    groupNames.forEach(groupName => {
        const mtdGroup = mtdGroups[groupName] || { type: 'income', accounts: [] };
        const ytdGroup = ytdGroups[groupName] || { type: 'income', accounts: [] };
        const isRevenue = ytdGroup.type === 'income';
        // Merge accounts by coa_code + account_name
        const accountMap: Record<string, { account_name: string; coa_code: string; mtd: number; ytd: number }> = {};
        ytdGroup.accounts.forEach(acc => {
            const key = `${acc.coa_code}__${acc.account_name}`;
            accountMap[key] = { account_name: acc.account_name, coa_code: acc.coa_code, mtd: 0, ytd: acc.net_amount };
        });
        mtdGroup.accounts.forEach(acc => {
            const key = `${acc.coa_code}__${acc.account_name}`;
            if (!accountMap[key]) accountMap[key] = { account_name: acc.account_name, coa_code: acc.coa_code, mtd: acc.net_amount, ytd: 0 };
            else accountMap[key].mtd = acc.net_amount;
        });
        const accounts = Object.values(accountMap).map(acc => ({
            ...acc,
            mtd: acc.mtd || 0,
            ytd: acc.ytd || 0
        }));
        const groupMTD = accounts.reduce((sum, acc) => sum + acc.mtd, 0);
        const groupYTD = accounts.reduce((sum, acc) => sum + acc.ytd, 0);
        if (isRevenue) {
            totalRevenueMTD += groupMTD;
            totalRevenueYTD += groupYTD;
        } else {
            totalExpenseMTD += groupMTD;
            totalExpenseYTD += groupYTD;
        }

        // Section header
        rows.push([groupName, '', '', '', '']);
        // Account rows
        accounts.forEach(acc => {
            rows.push([
                acc.account_name,
                acc.mtd,
                '', // % will be filled after totals
                acc.ytd,
                ''
            ]);
        });
        // Subtotal row
        rows.push([
            `Subtotal ${groupName}`,
            groupMTD,
            '', // % will be filled after totals
            groupYTD,
            ''
        ]);
    });

    // Gross and Nett Profit
    const grossProfitMTD = totalRevenueMTD - totalExpenseMTD;
    const grossProfitYTD = totalRevenueYTD - totalExpenseYTD;

    rows.push(['Gross Profit', grossProfitMTD, '', grossProfitYTD, '']);
    rows.push(['Total Nett Profit (Loss)', grossProfitMTD, '', grossProfitYTD, '']);

    // Now fill in the % columns
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (typeof row[1] === 'number') {
            row[2] = totalRevenueMTD ? ((row[1] as number) / totalRevenueMTD * 100).toFixed(1) + '%' : '';
        }
        if (typeof row[3] === 'number') {
            row[4] = totalRevenueYTD ? ((row[3] as number) / totalRevenueYTD * 100).toFixed(1) + '%' : '';
        }
    }

    // Export to Excel
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Set custom column widths for better readability
    ws['!cols'] = [
        { wch: 40 }, // Description
        { wch: 18 }, // MTD
        { wch: 10 }, // MTD %
        { wch: 18 }, // YTD
        { wch: 10 }, // YTD %
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laba Rugi');
    XLSX.writeFile(wb, `LabaRugi_${dateRange.startDate}_${dateRange.endDate}.xlsx`);
}

// --- Balance Sheet ---
interface BalanceSheetItem {
    type: 'asset' | 'liability' | 'equity';
    account_name: string;
    balance: number;
    coa_code: string;
    transaction_date: string;
    group_name: string;
}

export async function exportBalanceSheetToExcel({ data, endDate }: { data: BalanceSheetItem[]; endDate: string }) {
    // Group by type and group_name
    const grouped: Record<string, Record<string, BalanceSheetItem[]>> = {};
    data.forEach(item => {
        if (!grouped[item.type]) grouped[item.type] = {};
        if (!grouped[item.type][item.group_name]) grouped[item.type][item.group_name] = [];
        grouped[item.type][item.group_name].push(item);
    });
    const assetsGroup = grouped['asset'] || {};
    const liabilitiesGroup = grouped['liability'] || {};
    const equityGroup = grouped['equity'] || {};
    const totalAssets = Object.values(assetsGroup).flat().reduce((sum, item) => sum + (item.balance || 0), 0);
    const totalLiabilities = Object.values(liabilitiesGroup).flat().reduce((sum, item) => sum + (item.balance || 0), 0);
    const totalEquity = Object.values(equityGroup).flat().reduce((sum, item) => sum + (item.balance || 0), 0);
    const totalLiabEquity = totalLiabilities + totalEquity;
    const percent = (val: number, total: number) => total ? ((val / total) * 100).toFixed(1) + '%' : '-';
    const rows: (string | number)[][] = [];
    // Table header
    rows.push(['Description', 'Current', '%']);
    // Assets
    rows.push(['AKTIVA', '', '']);
    Object.entries(assetsGroup).forEach(([groupName, accounts]) => {
        const subtotal = accounts.reduce((sum, item) => sum + (item.balance || 0), 0);
        rows.push([groupName, '', '']);
        accounts.forEach(acc => {
            rows.push([
                acc.account_name,
                acc.balance,
                percent(acc.balance, totalAssets)
            ]);
        });
        rows.push([
            `Total ${groupName}`,
            subtotal,
            percent(subtotal, totalAssets)
        ]);
    });
    rows.push(['TOTAL ASSET', totalAssets, '100%']);
    // Liabilities & Equity
    rows.push(['KEWAJIBAN & EKUITAS', '', '']);
    Object.entries(liabilitiesGroup).forEach(([groupName, accounts]) => {
        const subtotal = accounts.reduce((sum, item) => sum + (item.balance || 0), 0);
        rows.push([groupName, '', '']);
        accounts.forEach(acc => {
            rows.push([
                acc.account_name,
                acc.balance,
                percent(acc.balance, totalLiabilities)
            ]);
        });
        rows.push([
            `Total ${groupName}`,
            subtotal,
            percent(subtotal, totalLiabilities)
        ]);
    });
    Object.entries(equityGroup).forEach(([groupName, accounts]) => {
        const subtotal = accounts.reduce((sum, item) => sum + (item.balance || 0), 0);
        rows.push([groupName, '', '']);
        accounts.forEach(acc => {
            rows.push([
                acc.account_name,
                acc.balance,
                percent(acc.balance, totalEquity)
            ]);
        });
        rows.push([
            `Total ${groupName}`,
            subtotal,
            percent(subtotal, totalEquity)
        ]);
    });
    rows.push(['TOTAL LIAB. & EQUITY', totalLiabEquity, '100%']);
    // Export
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
        { wch: 40 }, // Description
        { wch: 20 }, // Current
        { wch: 10 }, // %
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');
    XLSX.writeFile(wb, `BalanceSheet_${endDate}.xlsx`);
}

// --- Journal ---
interface JournalEntry {
    transaction_date: string;
    keterangan: string;
    keterangan_with_tour: string;
    account_name: string;
    coa_code: string;
    account_type: string;
    debit: number;
    credit: number;
    ref: string;
    tour_code: string;
}

export async function exportJournalToExcel({ data, startDate, endDate }: { data: JournalEntry[]; startDate: string; endDate: string }) {
    const rows: (string | number)[][] = [];
    rows.push(['Tanggal', 'Keterangan', 'Akun', 'Tour Code', 'Debit', 'Kredit', 'Ref']);
    data.forEach(entry => {
        rows.push([
            entry.transaction_date,
            entry.keterangan_with_tour,
            entry.account_name,
            entry.tour_code,
            entry.debit > 0 ? entry.debit : '',
            entry.credit > 0 ? entry.credit : '',
            entry.ref
        ]);
    });
    // Totals row
    const totalDebit = data.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredit = data.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    rows.push(['Total', '', '', '', totalDebit, totalCredit, '']);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
        { wch: 14 }, // Tanggal
        { wch: 30 }, // Keterangan
        { wch: 20 }, // Akun
        { wch: 16 }, // Tour Code
        { wch: 18 }, // Debit
        { wch: 18 }, // Kredit
        { wch: 20 }, // Ref
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Journal');
    XLSX.writeFile(wb, `Journal_${startDate}_${endDate}.xlsx`);
}

// --- Ledger ---
interface LedgerEntry {
    transaction_date: string;
    keterangan: string;
    keterangan_with_tour: string;
    debit: number;
    credit: number;
    account_code: string;
    account_name: string;
    account_type: string;
    tour_code: string;
    ref: string;
    balance: number;
}

interface AccountGroup {
    account_name: string;
    account_code: string;
    account_type: string;
    entries: LedgerEntry[];
    total_debit: number;
    total_credit: number;
    balance: number;
}

export async function exportLedgerToExcel({ data, startDate, endDate }: { data: LedgerEntry[]; startDate: string; endDate: string }) {
    // Group by account_code
    const grouped: Record<string, AccountGroup> = {};
    data.forEach(entry => {
        if (!grouped[entry.account_code]) {
            grouped[entry.account_code] = {
                account_name: entry.account_name,
                account_code: entry.account_code,
                account_type: entry.account_type,
                entries: [],
                total_debit: 0,
                total_credit: 0,
                balance: 0
            };
        }
        grouped[entry.account_code].entries.push(entry);
        grouped[entry.account_code].total_debit += entry.debit || 0;
        grouped[entry.account_code].total_credit += entry.credit || 0;
        grouped[entry.account_code].balance = entry.balance;
    });
    const wb = XLSX.utils.book_new();
    Object.values(grouped).forEach(account => {
        const rows: (string | number)[][] = [];
        rows.push([
            `Account: ${account.account_name}`,
            `Code: ${account.account_code}`,
            `Type: ${account.account_type}`
        ]);
        rows.push([]);
        rows.push(['Tanggal', 'Keterangan', 'Debit', 'Kredit', 'Saldo']);
        account.entries.forEach(entry => {
            rows.push([
                entry.transaction_date,
                entry.keterangan_with_tour,
                entry.debit > 0 ? entry.debit : '',
                entry.credit > 0 ? entry.credit : '',
                entry.balance
            ]);
        });
        // Totals row
        rows.push([
            'Total',
            '',
            account.total_debit,
            account.total_credit,
            account.balance
        ]);
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [
            { wch: 14 }, // Tanggal
            { wch: 30 }, // Keterangan
            { wch: 18 }, // Debit
            { wch: 18 }, // Kredit
            { wch: 18 }, // Saldo
        ];
        // Sanitize sheet name: remove invalid characters
        let sheetName = account.account_name.substring(0, 28);
        sheetName = sheetName.replace(/[:\\/?*\[\]]/g, ' ');
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    XLSX.writeFile(wb, `Ledger_${startDate}_${endDate}.xlsx`);
}