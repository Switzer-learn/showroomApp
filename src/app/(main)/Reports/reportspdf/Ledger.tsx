'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { createClient } from '@/app/utils/supabase/client';

const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 70, // keep footer space
        paddingLeft: 40,
        paddingRight: 40,
        fontSize: 10, // revert to default size
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
    accountInfo: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#bfbfbf',
        fontSize: 10, // revert to bigger font
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#bfbfbf',
        borderBottomStyle: 'solid',
        minHeight: 25, // revert to bigger row height
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 5, // revert to bigger padding
        borderRightWidth: 1,
        borderRightColor: '#bfbfbf',
        wordBreak: 'break-word',
        flexWrap: 'wrap',
        minWidth: 0,
        maxWidth: '100%',
        fontSize: 10, // revert to bigger font
    },
    dateColumn: {
        width: '15%',
    },
    descriptionColumn: {
        width: '35%',
    },
    accountColumn: {
        width: '10%',
        flexWrap: 'wrap',
        minWidth: 0,
        maxWidth: '100%',
    },
    debitColumn: {
        width: '15%',
        textAlign: 'right',
    },
    creditColumn: {
        width: '15%',
        textAlign: 'right',
    },
    balanceColumn: {
        width: '25%',
        textAlign: 'right',
    },
    footerRow: {
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
    footerText: {
        fontSize: 8,
        color: '#666',
        flexShrink: 1,
        flexBasis: 0,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
    },
});

interface LedgerEntry {
    transaction_date: string;
    keterangan: string;
    debit: number;
    credit: number;
    account_code: string;
    account_name: string;
    account_type: string;
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

interface LedgerProps {
    startDate: Date;
    endDate: Date;
}

export default function Ledger({ startDate, endDate }: LedgerProps) {
    const [data, setData] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: ledgerData, error } = await supabase
                .from('v_ledger_entries')
                .select('*')
                .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
                .lte('transaction_date', format(endDate, 'yyyy-MM-dd'))
                .order('account_code', { ascending: true })
                .order('transaction_date', { ascending: true });
            
            if (error) throw error;
            setData(ledgerData as LedgerEntry[] || []);
        } catch (error) {
            console.error('Error fetching ledger data:', error);
        }
        setLoading(false);
    }, [startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Group data by account
    const groupedData = data.reduce((acc, entry) => {
        if (!acc[entry.account_code]) {
            acc[entry.account_code] = {
                account_name: entry.account_name,
                account_code: entry.account_code,
                account_type: entry.account_type,
                entries: [],
                total_debit: 0,
                total_credit: 0,
                balance: 0
            };
        }
        acc[entry.account_code].entries.push(entry);
        acc[entry.account_code].total_debit += entry.debit || 0;
        acc[entry.account_code].total_credit += entry.credit || 0;
        acc[entry.account_code].balance = entry.balance;
        return acc;
    }, {} as Record<string, AccountGroup>);

    useEffect(() => {
        if (loading) return;

        const MyDocument = (
            <Document>
                <Page size={undefined} style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.companyName}>PT BRO Bali Tour and Travel</Text>
                        <Text style={styles.companyInfo}>Jl. Pratama Jl. Nusa Dua No.55x, Benoa, Kec. Kuta Sel., Kabupaten Badung, Bali 80362</Text>
                        <Text style={styles.companyInfo}>Phone: +62 823-3316-1888 | Email: brobalitnt@gmail.com</Text>
                    </View>

                    <Text style={styles.reportTitle}>LAPORAN BUKU BESAR</Text>
                    <Text style={styles.period}>
                        Periode: {format(startDate, 'dd MMMM yyyy', { locale: id })} - {format(endDate, 'dd MMMM yyyy', { locale: id })}
                    </Text>

                    {Object.values(groupedData).map((account: AccountGroup, accountIndex) => (
                        <View key={accountIndex} style={{ marginBottom: 20 }}>
                            <View style={[styles.accountInfo, { marginTop: 16, marginBottom: 8 }]} wrap={false}>
                                <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 2 }}>{account.account_name}</Text>
                                <Text style={{ fontSize: 9 }}>Kode: {account.account_code} | Tipe: {account.account_type}</Text>
                            </View>

                            <View style={styles.table}>
                                {/* Table Header */}
                                <View style={[styles.tableRow, styles.tableHeader]} fixed wrap={false}>
                                    <Text style={[styles.tableCell, styles.dateColumn]}>Tanggal</Text>
                                    <Text style={[styles.tableCell, styles.descriptionColumn]}>Keterangan</Text>
                                    <Text style={[styles.tableCell, styles.debitColumn]}>Debit</Text>
                                    <Text style={[styles.tableCell, styles.creditColumn]}>Kredit</Text>
                                    <Text style={[styles.tableCell, styles.balanceColumn]}>Saldo</Text>
                                </View>

                                {/* Data Rows */}
                                {account.entries.map((entry: LedgerEntry, entryIndex: number) => (
                                    <View key={entryIndex} style={styles.tableRow} wrap={false}>
                                        <Text style={[styles.tableCell, styles.dateColumn]}>
                                            {format(new Date(entry.transaction_date), 'dd/MM/yyyy')}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.descriptionColumn]}>
                                            {entry.keterangan}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.debitColumn]}>
                                            {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.creditColumn]}>
                                            {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.balanceColumn]}>
                                            {formatCurrency(entry.balance)}
                                        </Text>
                                    </View>
                                ))}

                                {/* Add totals row */}
                                <View style={[styles.tableRow, { backgroundColor: '#f8f9fa', fontWeight: 'bold' }]} wrap={false}>
                                    <Text style={[styles.tableCell, styles.dateColumn]}>Total</Text>
                                    <Text style={[styles.tableCell, styles.descriptionColumn]}></Text>
                                    <Text style={[styles.tableCell, styles.debitColumn]}>
                                        {formatCurrency(account.total_debit)}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.creditColumn]}>
                                        {formatCurrency(account.total_credit)}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.balanceColumn]}>
                                        {formatCurrency(account.balance)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Flex footer row with both footers justified between */}
                    <View style={styles.footerRow} fixed>
                        <Text style={[styles.footerText, { flex: 1, textAlign: 'left', marginRight: 10 }]}>
                            Laporan ini dibuat secara otomatis oleh sistem dan tidak memerlukan tanda tangan basah
                        </Text>
                        <Text
                            style={[styles.footerText, { flex: 1, textAlign: 'right', marginLeft: 10 }]}
                            render={({ pageNumber, totalPages }) =>
                                `LAPORAN BUKU BESAR - ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')} page ${pageNumber} of ${totalPages}`
                            }
                        />
                    </View>
                </Page>
            </Document>
        );

        pdf(MyDocument)
            .toBlob()
            .then(blob => {
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            });

        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, data, startDate, endDate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!pdfUrl) {
        return <div>Membuat laporan PDF...</div>;
    }

    // Render PDF in iframe
    return (
        <iframe
            src={pdfUrl}
            title="Laporan Buku Besar"
            style={{ width: "100%", height: "100%", border: "none" }}
            
        />
    );
}
