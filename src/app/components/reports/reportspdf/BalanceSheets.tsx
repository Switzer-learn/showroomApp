'use client';

import { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { createClient } from '@/app/utils/supabase/client';

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        fontSize: 8,
        color: '#666',
        width: 'auto',
    },
});

interface BalanceSheetItem {
    type: 'asset' | 'liability' | 'equity';
    account_name: string;
    balance: number;
    coa_code: string;
    transaction_date: string;
    group_name: string;
}

interface BalanceSheetsProps {
    startDate?: Date;
    endDate: Date;
}

export default function BalanceSheets({ endDate }: BalanceSheetsProps) {
    const [data, setData] = useState<BalanceSheetItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const supabase = createClient();
                // Fetch current balance sheet as of endDate using the new function
                const { data: currentData, error: currentError } = await supabase
                    .rpc('fn_balance_sheet_latest', { end_date: format(endDate, 'yyyy-MM-dd') });
                if (currentError) throw currentError;
                setData(currentData || []);
                
            } catch (error) {
                console.error('Error fetching balance sheet data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [endDate]);

    const formatCurrency = (amount: number) => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return 'Rp 0';
        }
        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount));
        return amount < 0 ? `(${formatted})` : formatted;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    // Group by type and group_name
    function groupByTypeAndGroup(items: BalanceSheetItem[]) {
        const result: Record<string, Record<string, BalanceSheetItem[]>> = {};
        items.forEach(item => {
            if (!result[item.type]) result[item.type] = {};
            if (!result[item.type][item.group_name]) result[item.type][item.group_name] = [];
            result[item.type][item.group_name].push(item);
        });
        return result;
    }

    const grouped = groupByTypeAndGroup(data);

    // --- ASSETS ---
    const assetsGroup = grouped['asset'] || {};
    // --- LIABILITIES ---
    const liabilitiesGroup = grouped['liability'] || {};
    // --- EQUITY ---
    const equityGroup = grouped['equity'] || {};

    // Calculate totals
    const totalAssets = Object.values(assetsGroup).flat().reduce((sum, item) => sum + (item.balance || 0), 0);
    const totalLiabilities = Object.values(liabilitiesGroup).flat().reduce((sum, item) => sum + (item.balance || 0), 0);
    const totalEquity = Object.values(equityGroup).flat().reduce((sum, item) => sum + (item.balance || 0), 0);
    const totalLiabEquity = totalLiabilities + totalEquity;

    // Helper for percent
    const percent = (val: number, total: number) => total ? `${((val / total) * 100).toFixed(1)}%` : '-';

    // Render group
    function renderGroup(group: Record<string, BalanceSheetItem[]>, total: number) {
        return Object.entries(group).map(([groupName, accounts]) => {
            const subtotal = accounts.reduce((sum, item) => sum + (item.balance || 0), 0);
            return (
                <View key={groupName} style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{groupName}</Text>
                    {accounts.map(acc => (
                        <View key={acc.coa_code} style={{ flexDirection: 'row', paddingLeft: 16 }} wrap={false}>
                            <View style={{ width: '40%' }}>
                                <Text>{acc.account_name}</Text>
                            </View>
                            <Text style={{ width: '40%', textAlign: 'right' }}>{formatCurrency(acc.balance)}</Text>
                            <Text style={{ width: '20%', textAlign: 'right' }}>{percent(acc.balance, total)}</Text>
                        </View>
                    ))}
                    {/* Subtotal row */}
                    <View style={{ flexDirection: 'row', fontWeight: 'bold', backgroundColor: '#eee' }} wrap={false}>
                        <Text style={{ width: '40%' }}>Total {groupName}</Text>
                        <Text style={{ width: '40%', textAlign: 'right' }}>{formatCurrency(subtotal)}</Text>
                        <Text style={{ width: '20%', textAlign: 'right' }}>{percent(subtotal, total)}</Text>
                    </View>
                </View>
            );
        });
    }
    

    return (
        <PDFViewer style={{ width: '100%', height: '100%' }}>
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.companyName}>PT BRO Bali Tour and Travel</Text>
                        <Text style={styles.companyInfo}>Jl. Pratama Jl. Nusa Dua No.55x, Benoa, Kec. Kuta Sel., Kabupaten Badung, Bali 80362</Text>
                        <Text style={styles.companyInfo}>Phone: +62 823-3316-1888 | Email: brobalitnt@gmail.com</Text>
                    </View>

                    <Text style={styles.reportTitle}>LAPORAN NERACA</Text>
                    <Text style={styles.period}>
                        Per {format(endDate, 'dd MMMM yyyy', { locale: id })}
                    </Text>

                    {/* Table Header */}
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, fontWeight: 'bold', marginBottom: 4 }} wrap={false}>
                        <Text style={{ width: '40%' }}>Description</Text>
                        <Text style={{ width: '40%', textAlign: 'right' }}>Current</Text>
                        <Text style={{ width: '20%', textAlign: 'right' }}>%</Text>
                    </View>

                    {/* Assets */}
                    <Text style={{ fontWeight: 'bold', fontSize: 13, marginTop: 8 }}>AKTIVA</Text>
                    {renderGroup(assetsGroup, totalAssets)}
                    <View style={{ flexDirection: 'row', fontWeight: 'bold', backgroundColor: '#ddd', marginTop: 8 }} wrap={false}>
                        <Text style={{ width: '40%' }}>TOTAL ASSET</Text>
                        <Text style={{ width: '40%', textAlign: 'right' }}>{formatCurrency(totalAssets)}</Text>
                        <Text style={{ width: '20%', textAlign: 'right' }}>100%</Text>
                    </View>

                    {/* Liabilities & Equity */}
                    <Text style={{ fontWeight: 'bold', fontSize: 13, marginTop: 8 }}>KEWAJIBAN & EKUITAS</Text>
                    {renderGroup(liabilitiesGroup, totalLiabilities)}
                    {renderGroup(equityGroup, totalEquity)}
                    <View style={{ flexDirection: 'row', fontWeight: 'bold', backgroundColor: '#ddd', marginTop: 8 }} wrap={false}>
                        <Text style={{ width: '40%' }}>TOTAL LIAB. & EQUITY</Text>
                        <Text style={{ width: '40%', textAlign: 'right' }}>{formatCurrency(totalLiabEquity)}</Text>
                        <Text style={{ width: '20%', textAlign: 'right' }}>100%</Text>
                    </View>

                    <View
                        style={{
                            position: 'absolute',
                            bottom: 30,
                            left: 30,
                            right: 30,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            fontSize: 8,
                            color: '#666',
                            width: 'auto',
                        }}
                        fixed
                    >
                        <Text style={{ flex: 1, textAlign: 'left', marginRight: 10 }}>
                            Laporan ini dibuat secara otomatis oleh sistem dan tidak memerlukan tanda tangan basah
                        </Text>
                        <Text
                            style={{ flex: 1, textAlign: 'right', marginLeft: 10 }}
                            render={({ pageNumber, totalPages }) =>
                                `NERACA - ${format(endDate, 'dd/MM/yyyy')} - page number ${pageNumber} of ${totalPages}`
                            }
                        />
                    </View>
                </Page>
            </Document>
        </PDFViewer>
    );
}
