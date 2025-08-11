"use client";

import { X } from 'lucide-react';
import React, { useMemo } from 'react';

/**
 * Props for the PDFViewerModal component
 * Displays a modal with server-generated PDF reports
 */
interface PDFViewerModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback function to close the modal */
    onClose: () => void;
    /** Type of report to display */
    reportType: string;
    /** Start date for the report */
    startDate: Date;
    /** End date for the report */
    endDate: Date;
    /** Optional tour code for specific reports */
    tourCode?: string;
}

export default function PDFViewerModal({ isOpen, onClose, reportType, startDate, endDate, tourCode }: PDFViewerModalProps) {
    if (!isOpen) return null;

    const url = useMemo(() => {
        const params = new URLSearchParams({
            type: reportType,
            startDate: new Date(startDate).toISOString().slice(0, 10),
            endDate: new Date(endDate).toISOString().slice(0, 10),
        });
        if (tourCode) params.set('tourCode', tourCode);
        return `/reports/preview?${params.toString()}`;
    }, [reportType, startDate, endDate, tourCode]);

    const title =
        reportType === 'laba-rugi' ? 'Laporan Laba Rugi'
        : reportType === 'balance-sheets' ? 'Laporan Neraca'
        : reportType === 'journal' ? 'Laporan Jurnal'
        : reportType === 'ledger' ? 'Laporan Ledger'
        : 'Report Viewer';

    return (
        <div className="fixed inset-0 z-50 bg-black/50">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 bg-white border-b">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                        aria-label="Close PDF viewer"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden bg-white">
                    <iframe
                        src={url}
                        title={title}
                        className="w-full h-full"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
}