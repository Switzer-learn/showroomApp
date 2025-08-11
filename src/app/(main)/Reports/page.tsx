"use client";

import { useState } from "react";
import { ReportCardItem } from "@/app/components/reports/ReportCardItem";
import { DateRangeSelector, DateRange } from "@/app/components/reports/DateRangeSelector";
import { reportItems } from "@/app/components/reports/reportData";
import PDFViewerModal from "@/app/components/reports/PDFViewerModal";
import TourCodeInputModal from "@/app/components/reports/TourCodeInputModal";
import TourTransactionsModal from "@/app/components/reports/TourTransactionsModal";
import { createClient } from "@/app/utils/supabase/client";
import {
  exportLabaRugiToExcel,
  exportBalanceSheetToExcel,
  exportJournalToExcel,
  exportLedgerToExcel,
} from "./exportUtils";

export default function Reports() {
  const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  };

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: getFirstDayOfMonth(),
    endDate: new Date().toISOString().split("T")[0],
  });

  const [selectedReport, setSelectedReport] = useState<{
    type: string;
    isOpen: boolean;
  } | null>(null);

  const [tourCodeModal, setTourCodeModal] = useState(false);
  const [tourTransactionsModal, setTourTransactionsModal] = useState(false);
  const [selectedTourCode, setSelectedTourCode] = useState("");

  const handleViewReport = (title: string, route: string, isTourReport?: boolean) => {
    if (isTourReport) {
      setTourCodeModal(true);
    } else {
      setSelectedReport({
        type: route,
        isOpen: true,
      });
    }
  };

  const closeModal = () => setSelectedReport(null);

  const handleTourCodeSubmit = (tourCode: string) => {
    setSelectedTourCode(tourCode);
    setTourCodeModal(false);
    setTourTransactionsModal(true);
  };

  const closeTourTransactionsModal = () => {
    setTourTransactionsModal(false);
    setSelectedTourCode("");
  };

  // Exports
  const handleExportLabaRugiExcel = async () => {
    const supabase = createClient();
    const { data: mtdData, error: mtdError } = await supabase.rpc("fn_pnl_mtd", {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    });
    if (mtdError) return alert("Error fetching MTD data");
    const { data: ytdData, error: ytdError } = await supabase.rpc("fn_pnl_ytd", {
      end_date: dateRange.endDate,
    });
    if (ytdError) return alert("Error fetching YTD data");
    await exportLabaRugiToExcel({ mtdData: mtdData || [], ytdData: ytdData || [], dateRange });
  };

  const handleExportBalanceSheetExcel = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("fn_balance_sheet_latest", { end_date: dateRange.endDate });
    if (error) return alert("Error fetching Balance Sheet data");
    await exportBalanceSheetToExcel({ data: data || [], endDate: dateRange.endDate });
  };

  const handleExportJournalExcel = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("v_journal_entries")
      .select("*")
      .gte("transaction_date", dateRange.startDate)
      .lte("transaction_date", dateRange.endDate)
      .order("transaction_date", { ascending: true });
    if (error) return alert("Error fetching Journal data");
    await exportJournalToExcel({ data: data || [], startDate: dateRange.startDate, endDate: dateRange.endDate });
  };

  const handleExportLedgerExcel = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("v_ledger_entries")
      .select("*")
      .gte("transaction_date", dateRange.startDate)
      .lte("transaction_date", dateRange.endDate)
      .order("account_code", { ascending: true })
      .order("transaction_date", { ascending: true });
    if (error) return alert("Error fetching Ledger data");
    await exportLedgerToExcel({ data: data || [], startDate: dateRange.startDate, endDate: dateRange.endDate });
  };

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Soft background depth */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(1200px_600px_at_85%_10%,rgba(37,99,235,0.08),transparent_60%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Header + Context Card */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
              <p className="text-gray-500 text-sm">Pilih periode dan jenis laporan yang ingin Anda lihat</p>
            </div>
          </div>

          {/* Context hero card */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/60 to-white p-4 sm:p-5">
            <div className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">📊</div>
                <div>
                  <p className="text-sm text-gray-600">Periode aktif</p>
                  <p className="text-sm font-medium text-gray-900 tabular-nums">
                    {dateRange.startDate} &mdash; {dateRange.endDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportLabaRugiExcel}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  ⬇️ Export Laba Rugi
                </button>
                <button
                  onClick={handleExportBalanceSheetExcel}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  ⬇️ Neraca
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range inside a highlighted card */}
        <section className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50/40 to-white shadow-sm p-5">
          <div className="pointer-events-none absolute -top-6 -left-6 h-20 w-20 rounded-full bg-blue-200/30 blur-2xl" />
          <div className="mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Periode Laporan</h2>
            <p className="text-xs text-gray-500">Rentang tanggal ini akan mempengaruhi semua laporan dan ekspor.</p>
          </div>
          <DateRangeSelector dateRange={dateRange} onDateChange={setDateRange} />
        </section>

        {/* Reports Grid styled as dashboard cards */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Semua Laporan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportItems.map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md focus-within:ring-1 focus-within:ring-blue-300"
              >
                <div className="pointer-events-none absolute -top-10 -right-14 h-36 w-36 rotate-12 bg-gradient-to-br from-blue-600/10 to-transparent blur-2xl" />

                <div className="mb-3 flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-gray-900">{item.title}</h3>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        Keuangan
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleViewReport(item.title, item.route, item.isTourReport)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    Lihat
                  </button>

                  {item.route === "laba-rugi" && (
                    <button
                      onClick={handleExportLabaRugiExcel}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      ⬇️ Excel
                    </button>
                  )}
                  {item.route === "balance-sheets" && (
                    <button
                      onClick={handleExportBalanceSheetExcel}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      ⬇️ Excel
                    </button>
                  )}
                  {item.route === "journal" && (
                    <button
                      onClick={handleExportJournalExcel}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      ⬇️ Excel
                    </button>
                  )}
                  {item.route === "ledger" && (
                    <button
                      onClick={handleExportLedgerExcel}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      ⬇️ Excel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Viewer Modal */}
      {selectedReport && (
        <PDFViewerModal
          isOpen={selectedReport.isOpen}
          onClose={closeModal}
          reportType={selectedReport.type}
          startDate={new Date(dateRange.startDate)}
          endDate={new Date(dateRange.endDate)}
        />
      )}

      {/* Modals */}
      <TourCodeInputModal isOpen={tourCodeModal} onClose={() => setTourCodeModal(false)} onSubmit={handleTourCodeSubmit} />
      <TourTransactionsModal isOpen={tourTransactionsModal} onClose={closeTourTransactionsModal} tourCode={selectedTourCode} />
    </main>
  );
}
