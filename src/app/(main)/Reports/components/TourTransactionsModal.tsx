'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MapPin, X, Calendar, Hash } from 'lucide-react';

interface TourTransactionEntry {
    transaction_id: string;
    transaction_date: string;
    tour_code: string;
    description: string;
    journal_entry_id: string;
    account_name: string;
    coa_code: string;
    account_type: string;
    debit: number;
    credit: number;
    created_at: string;
    ref?: string; // Added for filtering
}

interface TourTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourCode: string;
}

// Helper: filter out all entries with a ref that has a KOREKSI description
function filterCorrectedTransactions(entries: TourTransactionEntry[]) {
    const groupedByRef: { [ref: string]: TourTransactionEntry[] } = {};
    entries.forEach(entry => {
        const refKey = entry.ref || '';
        if (!refKey) return;
        if (!groupedByRef[refKey]) groupedByRef[refKey] = [];
        groupedByRef[refKey].push(entry);
    });
    const refsWithKoreksi = new Set<string>();
    Object.entries(groupedByRef).forEach(([ref, group]) => {
        if (group.some(e => e.description && e.description.toLowerCase().includes('koreksi'))) {
            refsWithKoreksi.add(ref);
        }
    });
    return entries.filter(entry => !refsWithKoreksi.has(entry.ref || ''));
}

export default function TourTransactionsModal({ isOpen, onClose, tourCode }: TourTransactionsModalProps) {
    const [entries, setEntries] = useState<TourTransactionEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('v_tour_transactions')
                .select('*')
                .eq('tour_code', tourCode.toUpperCase())
                .order('transaction_date', { ascending: false })
                .order('created_at', { ascending: false });
            if (error) throw error;
            setEntries(data || []);
            
        } catch (error) {
            console.error('Error fetching tour transactions:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && tourCode) {
            fetchTransactions();
        }
    }, [isOpen, tourCode]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (!isOpen) return null;

    // Filter out corrected transactions
    const visibleEntries = filterCorrectedTransactions(entries);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Transaksi Tour</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Hash className="w-4 h-4" />
                                    <span>{tourCode}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{entries.length} baris</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="loading loading-spinner loading-lg text-blue-600"></div>
                            <p className="text-gray-500">Memuat transaksi...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-6">
                        {visibleEntries.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada transaksi</h3>
                                    <p className="text-gray-500">
                                        Tidak ada transaksi untuk tour code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{tourCode}</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Deskripsi</th>
                                        <th className="text-right py-3 px-4 font-semibold text-green-700">Income</th>
                                        <th className="text-right py-3 px-4 font-semibold text-red-700">Expense</th>
                                        
                                        
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {visibleEntries.map((entry) => {
                                        const isIncomeSection = entry.account_type === 'income' || entry.account_type === 'asset';
                                        const isExpenseSection = entry.account_type === 'expense' || entry.account_type === 'liability';
                                        const amount = entry.debit > 0 ? entry.debit : entry.credit;
                                        return (
                                            <tr key={entry.journal_entry_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    {format(new Date(entry.transaction_date), 'dd/MM/yyyy', { locale: id })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {entry.description}
                                                </td>
                                                <td className="py-3 px-4 text-right text-green-700 font-medium">
                                                    {isIncomeSection ? formatCurrency(amount) : ''}
                                                </td>
                                                <td className="py-3 px-4 text-right text-red-700 font-medium">
                                                    {isExpenseSection ? formatCurrency(amount) : ''}
                                                </td>
                                                <td className="py-3 px-4 text-right text-red-700 font-medium">
                                                    {entry.account_type}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Totals row */}
                                    <tr className="font-bold bg-gray-50">
                                        <td colSpan={2} className="py-3 px-4 text-right">Total</td>
                                        <td className="py-3 px-4 text-right text-green-700">
                                            {formatCurrency(
                                                visibleEntries.reduce((sum, entry) => {
                                                    const isIncomeSection = entry.account_type === 'income' || entry.account_type === 'asset';
                                                    const amount = entry.debit > 0 ? entry.debit : entry.credit;
                                                    return sum + (isIncomeSection ? amount : 0);
                                                }, 0)
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right text-red-700">
                                            {formatCurrency(
                                                visibleEntries.reduce((sum, entry) => {
                                                    const isExpenseSection = entry.account_type === 'expense' || entry.account_type === 'liability';
                                                    const amount = entry.debit > 0 ? entry.debit : entry.credit;
                                                    return sum + (isExpenseSection ? amount : 0);
                                                }, 0)
                                            )}
                                        </td>
                                        <td className={`py-3 px-4 font-bold ${visibleEntries.reduce((sum, entry) => {
                                            const isIncomeSection = entry.account_type === 'income' || entry.account_type === 'asset';
                                            const isExpenseSection = entry.account_type === 'expense' || entry.account_type === 'liability';
                                            const amount = entry.debit > 0 ? entry.debit : entry.credit;
                                            return sum + (isIncomeSection ? amount : 0) - (isExpenseSection ? amount : 0);
                                        }, 0) > 0 ? 'text-green-700' : visibleEntries.reduce((sum, entry) => {
                                            const isIncomeSection = entry.account_type === 'income' || entry.account_type === 'asset';
                                            const isExpenseSection = entry.account_type === 'expense' || entry.account_type === 'liability';
                                            const amount = entry.debit > 0 ? entry.debit : entry.credit;
                                            return sum + (isIncomeSection ? amount : 0) - (isExpenseSection ? amount : 0);
                                        }, 0) < 0 ? 'text-red-700' : ''}`} colSpan={2}>
                                            {(() => {
                                                const net = visibleEntries.reduce((sum, entry) => {
                                                    const isIncomeSection = entry.account_type === 'income' || entry.account_type === 'asset';
                                                    const isExpenseSection = entry.account_type === 'expense' || entry.account_type === 'liability';
                                                    const amount = entry.debit > 0 ? entry.debit : entry.credit;
                                                    return sum + (isIncomeSection ? amount : 0) - (isExpenseSection ? amount : 0);
                                                }, 0);
                                                return formatCurrency(net);
                                            })()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 