'use client';

import { useState } from 'react';
import { MapPin, X } from 'lucide-react';

/**
 * Props for the TourCodeInputModal component
 * Displays a modal for entering a tour code to filter transactions
 */
interface TourCodeInputModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback function to close the modal */
    onClose: () => void;
    /** Callback function when the form is submitted with a tour code */
    onSubmit: (tourCode: string) => void;
}

export default function TourCodeInputModal({ isOpen, onClose, onSubmit }: TourCodeInputModalProps) {
    const [tourCode, setTourCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tourCode.trim()) {
            onSubmit(tourCode.trim().toLowerCase());
            setTourCode('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Masukkan Tour Code</h2>
                            <p className="text-sm text-gray-500">Filter transaksi berdasarkan kode tour</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tour Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Contoh: BALI-001, JKT-2024-001"
                                value={tourCode}
                                onChange={(e) => setTourCode(e.target.value)}
                                required
                                autoFocus
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Masukkan kode tour yang ingin Anda lihat transaksinya
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!tourCode.trim()}
                        >
                            Lihat Transaksi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 