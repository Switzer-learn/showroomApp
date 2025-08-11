import React, { ReactNode } from "react";
import { BarChart3, Calculator, FileText, BookOpen, MapPin } from "lucide-react";

export interface ReportItem {
    title: string;
    description: string;
    icon: ReactNode;
    route: string;
    isTourReport?: boolean;
}

export const reportItems: ReportItem[] = [
    {
        title: "Laporan Laba Rugi",
        description: "Analisis pendapatan dan pengeluaran untuk periode tertentu",
        icon: <BarChart3 className="w-6 h-6" />,
        route: "laba-rugi"
    },
    {
        title: "Laporan Neraca",
        description: "Ringkasan aset, kewajiban, dan ekuitas pada tanggal tertentu",
        icon: <Calculator className="w-6 h-6" />,
        route: "balance-sheets"
    },
    {
        title: "Laporan Jurnal",
        description: "Daftar lengkap transaksi jurnal dalam periode tertentu",
        icon: <FileText className="w-6 h-6" />,
        route: "journal"
    },
    {
        title: "Laporan Ledger",
        description: "Buku besar untuk setiap akun dalam periode tertentu",
        icon: <BookOpen className="w-6 h-6" />,
        route: "ledger"
    },
    {
        title: "Transaksi Tour",
        description: "Lihat transaksi berdasarkan tour code",
        icon: <MapPin className="w-6 h-6" />,
        route: "tour-transactions",
        isTourReport: true
    }
]; 