'use client';

import { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { createClient } from '@/app/utils/supabase/client';

// Create styles
const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 40,
        paddingRight: 40,
        fontSize: 10,
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    companyName: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    companyInfo: {
        fontSize: 10,
        marginBottom: 5,
    },
    reportTitle: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    period: {
        fontSize: 10,
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        borderBottomStyle: 'solid',
        paddingVertical: 5,
    },
    accountName: {
        width: '60%',
        paddingLeft: 10,
    },
    amount: {
        width: '40%',
        textAlign: 'right',
        paddingRight: 10,
    },
    total: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#000',
        borderTopStyle: 'solid',
        paddingTop: 5,
        marginTop: 5,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
    },
});

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

interface LabaRugiProps {
    startDate: Date;
    endDate: Date;
}

export default function LabaRugi({ startDate, endDate }: LabaRugiProps) {
    const [data, setData] = useState<{ mtd: PnLItem[]; ytd: PnLItem[] }>({ mtd: [], ytd: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const supabase = createClient();
                // Fetch MTD PnL using the function
                const { data: mtdData, error: mtdError } = await supabase
                    .rpc('fn_pnl_mtd', {
                        start_date: format(startDate, 'yyyy-MM-dd'),
                        end_date: format(endDate, 'yyyy-MM-dd'),
                    });
                if (mtdError) throw mtdError;
                // Fetch YTD PnL using the function
                const { data: ytdData, error: ytdError } = await supabase
                    .rpc('fn_pnl_ytd', {
                        end_date: format(endDate, 'yyyy-MM-dd'),
                    });
                if (ytdError) throw ytdError;
                setData({ mtd: mtdData || [], ytd: ytdData || [] });
            } catch (error) {
                console.error('Error fetching P&L data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [startDate, endDate]);

    if (loading) return <div>Loading...</div>;

    // Helper to group by group_name and type
    function groupPnLByGroup(items: PnLItem[]) {
        const groups: Record<string, { type: 'income' | 'expense'; accounts: { account_name: string; coa_code: string; net_amount: number }[] }> = {};
        items.forEach(item => {
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

    const mtdGroups = groupPnLByGroup(data.mtd);
    const ytdGroups = groupPnLByGroup(data.ytd);

    // Get all group names in order (income first, then expense)
    const groupNames = [
        ...Object.keys(mtdGroups).filter(g => mtdGroups[g].type === 'income'),
        ...Object.keys(mtdGroups).filter(g => mtdGroups[g].type === 'expense')
    ];

    // Helper for percent
    const percent = (val: number, total: number) => total ? `${((val / total) * 100).toFixed(1)}%` : '-';
    const formatCurrencyOrDash = (amount: number) => {
        if (amount === null || amount === undefined || isNaN(amount) || amount === 0) return '-';
        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount));
        return amount < 0 ? `(${formatted})` : formatted;
    };

    // Calculate subtotals and grand totals
    let totalRevenueMTD = 0, totalRevenueYTD = 0;
    let totalExpenseMTD = 0, totalExpenseYTD = 0;
    const groupSections = groupNames.map(groupName => {
        const mtdGroup = mtdGroups[groupName] || { type: 'income', accounts: [] };
        const ytdGroup = ytdGroups[groupName] || { type: 'income', accounts: [] };
        const isRevenue = ytdGroup.type === 'income'; // Use YTD for account name/type
        // Merge accounts by coa_code + account_name, using YTD as source of truth
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
        return { groupName, isRevenue, accounts, groupMTD, groupYTD };
    });
    const grossProfitMTD = totalRevenueMTD - totalExpenseMTD;
    const grossProfitYTD = totalRevenueYTD - totalExpenseYTD;

    return (
        <PDFViewer style={{ width: '100%', height: '100%' }}>
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.companyName}>PT BRO Tour and Travel</Text>
                        <Text style={styles.companyInfo}>Jl. Pratama Jl. Nusa Dua No.55x, Benoa, Kec. Kuta Sel., Kabupaten Badung, Bali 80362</Text>
                        <Text style={styles.companyInfo}>Phone: +62 823-3316-1888 | Email: brobalitnt@gmail.com</Text>
                    </View>

                    <Text style={styles.reportTitle}>LAPORAN LABA RUGI</Text>
                    <Text style={styles.period}>
                        Periode {format(startDate, 'dd MMMM yyyy', { locale: id })} - {format(endDate, 'dd MMMM yyyy', { locale: id })}
                    </Text>

                    {/* Table Header */}
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, fontWeight: 'bold', marginBottom: 4 }} wrap={false}>
                        <Text style={{ width: '40%' }}>Description</Text>
                        <Text style={{ width: '15%', textAlign: 'right' }}>MTD</Text>
                        <Text style={{ width: '10%', textAlign: 'right' }}>%</Text>
                        <Text style={{ width: '15%', textAlign: 'right' }}>YTD</Text>
                        <Text style={{ width: '10%', textAlign: 'right' }}>%</Text>
                    </View>
                    {groupSections.map(section => (
                        <View key={section.groupName} style={{ marginBottom: 8 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{section.groupName}</Text>
                            {section.accounts.map(acc => (
                                <View key={acc.account_name} style={{ flexDirection: 'row', paddingLeft: 16 }} wrap={false}>
                                    <Text style={{ width: '40%' }}>{acc.account_name}</Text>
                                    <Text style={{ width: '15%', textAlign: 'right' }}>{formatCurrencyOrDash(acc.mtd)}</Text>
                                    <Text style={{ width: '10%', textAlign: 'right' }}>{percent(acc.mtd, section.isRevenue ? totalRevenueMTD : totalExpenseMTD)}</Text>
                                    <Text style={{ width: '15%', textAlign: 'right' }}>{formatCurrencyOrDash(acc.ytd)}</Text>
                                    <Text style={{ width: '10%', textAlign: 'right' }}>{percent(acc.ytd, section.isRevenue ? totalRevenueYTD : totalExpenseYTD)}</Text>
                                </View>
                            ))}
                            {/* Subtotal row */}
                            <View style={{ flexDirection: 'row', fontWeight: 'bold', backgroundColor: '#eee' }} wrap={false}>
                                <Text style={{ width: '40%' }}>Subtotal {section.groupName}</Text>
                                <Text style={{ width: '15%', textAlign: 'right' }}>{formatCurrencyOrDash(section.groupMTD)}</Text>
                                <Text style={{ width: '10%', textAlign: 'right' }}>{percent(section.groupMTD, section.isRevenue ? totalRevenueMTD : totalExpenseMTD)}</Text>
                                <Text style={{ width: '15%', textAlign: 'right' }}>{formatCurrencyOrDash(section.groupYTD)}</Text>
                                <Text style={{ width: '10%', textAlign: 'right' }}>{percent(section.groupYTD, section.isRevenue ? totalRevenueYTD : totalExpenseYTD)}</Text>
                            </View>
                        </View>
                    ))}
                    {/* Gross Profit */}
                    <View style={{ flexDirection: 'row', fontWeight: 'bold', backgroundColor: '#ddd', marginTop: 8 }} wrap={false}>
                        <Text style={{ width: '40%' }}>Gross Profit</Text>
                        <Text style={{ width: '15%', textAlign: 'right' }}>{formatCurrencyOrDash(grossProfitMTD)}</Text>
                        <Text style={{ width: '10%', textAlign: 'right' }}>{percent(grossProfitMTD, totalRevenueMTD)}</Text>
                        <Text style={{ width: '15%', textAlign: 'right' }}>{formatCurrencyOrDash(grossProfitYTD)}</Text>
                        <Text style={{ width: '10%', textAlign: 'right' }}>{percent(grossProfitYTD, totalRevenueYTD)}</Text>
                    </View>
                    {/* Nett Profit */}
                    <View style={{ flexDirection: 'row', fontWeight: 'bold', backgroundColor: '#bbb', marginTop: 8 }} wrap={false}>
                        <Text style={{ width: '40%' }}>Total Nett Profit (Loss)</Text>
                        <Text style={{ width: '15%', textAlign: 'right' }}>{formatCurrencyOrDash(grossProfitMTD)}</Text>
                        <Text style={{ width: '10%', textAlign: 'right' }}>{percent(grossProfitMTD, totalRevenueMTD)}</Text>
                        <Text style={{ width: '15%', textAlign: 'right' }}>{formatCurrencyOrDash(grossProfitYTD)}</Text>
                        <Text style={{ width: '10%', textAlign: 'right' }}>{percent(grossProfitYTD, totalRevenueYTD)}</Text>
                    </View>

                    <Text style={styles.footer}>
                        Laporan ini dibuat secara otomatis oleh sistem dan tidak memerlukan tanda tangan basah
                    </Text>
                </Page>
            </Document>
        </PDFViewer>
    );
}
