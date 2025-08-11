import * as XLSX from 'xlsx';

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