"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";

function formatDate(d: string | null) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

function currencyIDR(n: number) {
  if (!Number.isFinite(n)) return "-";
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
  return n < 0 ? `(${formatted})` : formatted;
}

export default function ReportsPreviewPage() {
  const params = useSearchParams();
  const type = params.get("type") || "laba-rugi";
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  const tourCode = params.get("tourCode");

  const title = useMemo(() => {
    switch (type) {
      case "laba-rugi":
        return "Laporan Laba Rugi";
      case "balance-sheets":
        return "Laporan Neraca";
      case "journal":
        return "Laporan Jurnal";
      case "ledger":
        return "Laporan Ledger";
      default:
        return "Laporan";
    }
  }, [type]);

  // Placeholder table rows. Replace with live data wiring later.
  const sampleRows = [
    { tanggal: startDate ?? "-", deskripsi: "Contoh 1", jumlah: 1000000 },
    { tanggal: endDate ?? "-", deskripsi: "Contoh 2", jumlah: 2500000 },
  ];

  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <style>{`
          :root {
            --text: #111827;
            --muted: #6b7280;
            --border: #e5e7eb;
            --bg: #ffffff;
            --bg-soft: #f9fafb;
          }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: var(--text);
            background: var(--bg);
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 24px;
          }
          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 16px;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 8px;
          }
          .meta {
            font-size: 12px;
            color: var(--muted);
            margin: 0;
          }
          .actions {
            display: flex;
            gap: 8px;
          }
          .btn {
            appearance: none;
            border: 1px solid var(--border);
            background: var(--bg);
            border-radius: 8px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 12px;
          }
          .btn.primary {
            background: #111827;
            color: white;
            border-color: #111827;
          }
          .card {
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 16px;
            margin-top: 8px;
            background: var(--bg);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid var(--border);
            padding: 8px;
          }
          th {
            background: var(--bg-soft);
            text-align: left;
          }
          tfoot td {
            font-weight: 700;
            background: #f3f4f6;
          }
          .footer {
            margin-top: 24px;
            font-size: 11px;
            color: var(--muted);
            text-align: right;
          }
          /* Print styles */
          @media print {
            @page { size: A4; margin: 12mm; }
            .actions { display: none !important; }
            .container { padding: 0; }
            body { background: white; }
            .card { break-inside: avoid; }
            .footer { position: fixed; bottom: 0; left: 0; right: 0; }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div>
              <h1 className="title">{title}</h1>
              <p className="meta">
                Periode: <strong>{formatDate(startDate)}</strong> s/d <strong>{formatDate(endDate)}</strong>
                {tourCode ? (
                  <> &middot; Kode Tour: <strong>{tourCode}</strong></>
                ) : null}
              </p>
            </div>
            <div className="actions" aria-hidden="true">
              <button className="btn" onClick={() => window.history.back()}>Kembali</button>
              <button className="btn primary" onClick={() => window.print()}>Cetak / Simpan PDF</button>
            </div>
          </div>

          {/* Replace below with actual report sections per type */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Ringkasan</div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Tanggal</th>
                  <th>Deskripsi</th>
                  <th style={{ width: "25%", textAlign: "right" }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(r.tanggal)}</td>
                    <td>{r.deskripsi}</td>
                    <td style={{ textAlign: "right" }}>{currencyIDR(r.jumlah)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Total</td>
                  <td style={{ textAlign: "right" }}>
                    {currencyIDR(sampleRows.reduce((a, b) => a + b.jumlah, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="footer">
            Dihasilkan oleh sistem pada {new Date().toLocaleString("id-ID")}
          </div>
        </div>
      </body>
    </html>
  );
}