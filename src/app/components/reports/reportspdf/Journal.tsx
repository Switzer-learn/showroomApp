'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
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
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#bfbfbf',
        fontSize: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#bfbfbf',
        borderBottomStyle: 'solid',
        minHeight: 25,
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#bfbfbf',
        textAlign: 'left',
    },
    dateColumn: {
        width: '12%',
        textAlign: 'center',
    },
    descriptionColumn: {
        width: '25%',
    },
    accountColumn: {
        width: '18%',
        paddingLeft: 8,
        paddingRight: 8,
    },
    debitColumn: {
        width: '18%',
        textAlign: 'right',
    },
    creditColumn: {
        width: '18%',
        textAlign: 'right',
    },
    refColumn: {
        width: '20%',
        fontSize: 7,
        textAlign: 'left',
        paddingLeft: 8,
        paddingRight: 8,
        justifyContent: 'center',
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

interface JournalProps {
    startDate: Date;
    endDate: Date;
}

export default function Journal({ startDate, endDate }: JournalProps) {
    const [data, setData] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: journalData, error } = await supabase
                .from('v_journal_entries')
                .select('*')
                .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
                .lte('transaction_date', format(endDate, 'yyyy-MM-dd'))
                .order('transaction_date', { ascending: true });

            if (error) throw error;
            setData(journalData as JournalEntry[] || []);
        } catch (error) {
            console.error('Error fetching journal data:', error);
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

    const wrapText = (text: string, maxLength = 20): string => {
        if (!text) return '';
        return text.match(new RegExp(`.{1,${maxLength}}`, 'g'))?.join('\n') || text;
    };

    const totals = data.reduce((acc, entry) => {
        acc.totalDebit += entry.debit || 0;
        acc.totalCredit += entry.credit || 0;
        return acc;
    }, { totalDebit: 0, totalCredit: 0 });

    // PDF generation effect
    useEffect(() => {
        if (loading) return;

        const MyDocument = (
            <Document>
                <Page size="A4" orientation="landscape" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.companyName}>PT BRO Tour and Travel</Text>
                        <Text style={styles.companyInfo}>
                            Jl. Pratama Jl. Nusa Dua No.55x, Benoa, Kec. Kuta Sel., Kabupaten Badung, Bali 80362
                        </Text>
                        <Text style={styles.companyInfo}>
                            Phone: +62 823-3316-1888 | Email: brobalitnt@gmail.com
                        </Text>
                    </View>

                    <Text style={styles.reportTitle}>LAPORAN JURNAL</Text>
                    <Text style={styles.period}>
                        Periode: {format(startDate, 'dd MMMM yyyy', { locale: id })} -{' '}
                        {format(endDate, 'dd MMMM yyyy', { locale: id })}
                    </Text>

                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]} fixed wrap={false}>
                            <Text style={[styles.tableCell, styles.dateColumn]}>Tanggal</Text>
                            <Text style={[styles.tableCell, styles.descriptionColumn]}>Keterangan</Text>
                            <Text style={[styles.tableCell, styles.accountColumn]}>Akun</Text>
                            <Text style={[styles.tableCell, styles.accountColumn]}>Tour Code</Text>
                            <Text style={[styles.tableCell, styles.debitColumn]}>Debit</Text>
                            <Text style={[styles.tableCell, styles.creditColumn]}>Kredit</Text>
                            <Text style={[styles.tableCell, styles.refColumn]}>Ref</Text>
                        </View>

                        {data.map((entry, index) => (
                            <View key={index} style={styles.tableRow} wrap={false}>
                                <Text style={[styles.tableCell, styles.dateColumn]}>
                                    {format(new Date(entry.transaction_date), 'dd/MM/yyyy')}
                                </Text>
                                <Text style={[styles.tableCell, styles.descriptionColumn]}>
                                    {entry.keterangan_with_tour || entry.keterangan}
                                </Text>
                                <Text style={[styles.tableCell, styles.accountColumn]}>
                                    {entry.account_name}
                                </Text>
                                <Text style={[styles.tableCell, styles.accountColumn]}>
                                    {entry.tour_code}
                                </Text>
                                <Text style={[styles.tableCell, styles.debitColumn]}>
                                    {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
                                </Text>
                                <Text style={[styles.tableCell, styles.creditColumn]}>
                                    {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
                                </Text>
                                <Text style={[styles.tableCell, styles.refColumn]}>
                                    {wrapText(entry.ref)}
                                </Text>
                            </View>
                        ))}

                        {/* Totals Row */}
                        <View style={[styles.tableRow, { backgroundColor: '#f8f9fa', fontWeight: 'bold' }]} wrap={false}>
                            <Text style={[styles.tableCell, styles.dateColumn]}>Total</Text>
                            <Text style={[styles.tableCell, styles.descriptionColumn]}></Text>
                            <Text style={[styles.tableCell, styles.accountColumn]}></Text>
                            <Text style={[styles.tableCell, styles.accountColumn]}></Text>
                            <Text style={[styles.tableCell, styles.debitColumn]}>
                                {formatCurrency(totals.totalDebit)}
                            </Text>
                            <Text style={[styles.tableCell, styles.creditColumn]}>
                                {formatCurrency(totals.totalCredit)}
                            </Text>
                            <Text style={[styles.tableCell, styles.refColumn]}></Text>
                        </View>
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
                                `JURNAL - ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')} - page number ${pageNumber} of ${totalPages}`
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
            title="Laporan Jurnal"
            style={{ width: "100%", height: "100%", border: "none" }}
        />
    );
}
