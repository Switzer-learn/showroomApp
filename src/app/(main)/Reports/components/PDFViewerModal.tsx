import { X } from 'lucide-react';
import LabaRugi from '../reportspdf/LabaRugi';
import BalanceSheets from '../reportspdf/BalanceSheets';
import Journal from '../reportspdf/Journal';
import Ledger from '../reportspdf/Ledger';

interface PDFViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: string;
    startDate: Date;
    endDate: Date;
}

export default function PDFViewerModal({ isOpen, onClose, reportType, startDate, endDate }: PDFViewerModalProps) {
    if (!isOpen) return null;

    const renderReport = () => {
        switch (reportType) {
            case 'laba-rugi':
                return <LabaRugi startDate={startDate} endDate={endDate} />;
            case 'balance-sheets':
                return <BalanceSheets startDate={startDate} endDate={endDate} />;
            case 'journal':
                return <Journal startDate={startDate} endDate={endDate} />;
            case 'ledger':
                return <Ledger startDate={startDate} endDate={endDate} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">
                        {reportType === 'laba-rugi' && 'Laporan Laba Rugi'}
                        {reportType === 'balance-sheets' && 'Laporan Neraca'}
                        {reportType === 'journal' && 'Laporan Jurnal'}
                        {reportType === 'ledger' && 'Laporan Ledger'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    {renderReport()}
                </div>
            </div>
        </div>
    );
} 