"use client";

import { useEffect, useMemo, useState } from "react";
import { createSale, createCustomer } from "@/app/lib/dbFunction";

type Props = {
  open: boolean;
  onClose: () => void;
  car?: {
    id: string;
    title: string;
    price: number;
    plat_nomor?: string;
  } | null;
  onRecorded?: (saleId: string) => void;
};

type PaymentMethod = "Tunai" | "Kredit";

export default function SellCarDrawer({ open, onClose, car, onRecorded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Tunai");
  const [uangMuka, setUangMuka] = useState(0);
  const [namaLeasing, setNamaLeasing] = useState("");
  const [hargaKredit, setHargaKredit] = useState(0);
  const [danaLeasing, setDanaLeasing] = useState(0);
  const [salePrice, setSalePrice] = useState(car?.price ?? 0);

  useEffect(() => {
    if (car) {
      setSalePrice(car.price ?? 0);
    }
  }, [car?.id]);

  const totalHarga = useMemo(() => {
    if (paymentMethod === "Tunai") return salePrice || 0;
    return (uangMuka || 0) + (hargaKredit || 0) + (danaLeasing || 0);
  }, [paymentMethod, salePrice, uangMuka, hargaKredit, danaLeasing]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      if (!car?.id) throw new Error("Car context missing");
      if (!buyerName.trim()) throw new Error("Nama pembeli wajib diisi");
      if (totalHarga <= 0) throw new Error("Total harga tidak valid");

      // Create customer record first
      const customer = await createCustomer({
        nama: buyerName.trim(),
        no_hp: buyerPhone.trim() || undefined,
        alamat: buyerAddress.trim() || undefined,
      });

      if (!customer?.id) {
        throw new Error("Failed to create customer record");
      }

      // Create sale with actual customer_id
      const sale = await createSale({
        car_id: car.id,
        customer_id: customer.id,
        sale_price: totalHarga,
        payment_method: paymentMethod,
        sale_date: new Date().toISOString().slice(0, 10),
      });

      onRecorded?.(sale.id as string);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Gagal menyimpan penjualan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer drawer-end drawer-open z-50">
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-side pointer-events-none"></div>
      <div className="drawer-content"></div>
      <div id="sell-car-drawer" className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-gray-200 shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Record Sale</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Close</button>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mt-2 rounded-lg border border-gray-200 p-3 bg-white">
          <div className="text-sm text-gray-700">
            <div className="font-medium text-gray-900">{car?.title ?? "Select car"}</div>
            {car?.plat_nomor && <div className="text-xs text-gray-600">Plat: {car.plat_nomor}</div>}
          </div>
        </div>

        <form className="mt-4 space-y-5" onSubmit={handleSubmit} noValidate>
          <fieldset className="space-y-3 border border-gray-200 rounded-lg p-3">
            <legend className="px-2 text-sm text-gray-600">Buyer Info</legend>
            <input className="input input-bordered w-full" placeholder="Nama Pembeli" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input input-bordered" placeholder="No HP" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
              <input className="input input-bordered" placeholder="Alamat" value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} />
            </div>
          </fieldset>

          <fieldset className="space-y-3 border border-gray-200 rounded-lg p-3">
            <legend className="px-2 text-sm text-gray-600">Payment</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className="select select-bordered" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                <option value="Tunai">Tunai</option>
                <option value="Kredit">Kredit</option>
              </select>
              <input className="input input-bordered" type="number" placeholder="Sale Price" value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} />
            </div>

            {paymentMethod === "Kredit" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="input input-bordered" type="number" placeholder="Uang Muka" value={uangMuka} onChange={(e) => setUangMuka(Number(e.target.value))} />
                <input className="input input-bordered" placeholder="Nama Leasing" value={namaLeasing} onChange={(e) => setNamaLeasing(e.target.value)} />
                <input className="input input-bordered" type="number" placeholder="Harga Kredit" value={hargaKredit} onChange={(e) => setHargaKredit(Number(e.target.value))} />
                <input className="input input-bordered" type="number" placeholder="Dana dari Leasing" value={danaLeasing} onChange={(e) => setDanaLeasing(Number(e.target.value))} />
              </div>
            )}

            <div className="mt-2 rounded-md bg-blue-50 text-blue-800 border border-blue-200 px-3 py-2 text-sm">
              Total Harga: <span className="font-semibold">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalHarga || 0)}</span>
            </div>
          </fieldset>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button disabled={loading} className="btn btn-primary">{loading ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}