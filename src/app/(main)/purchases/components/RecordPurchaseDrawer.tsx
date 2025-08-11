"use client";

import { useState } from "react";
import { createPurchase } from "@/app/lib/dbFunction";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultCar?: { id: string; title: string } | null;
  onRecorded?: (purchaseId: string) => void;
};

type PaymentMethod = "Tunai" | "Transfer";

export default function RecordPurchaseDrawer({ open, onClose, defaultCar, onRecorded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [buyPrice, setBuyPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Tunai");
  const [vendorSource, setVendorSource] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      if (!defaultCar?.id) throw new Error("Car is required");
      if (!buyPrice || buyPrice <= 0) throw new Error("Buy price is invalid");
      const purchase = await createPurchase({
        car_id: defaultCar.id,
        buy_price: buyPrice,
        payment_method: paymentMethod,
        purchase_date: purchaseDate,
        vendor_source: vendorSource || undefined,
      });
      onRecorded?.(purchase.id as string);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer drawer-end drawer-open z-50">
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-side pointer-events-none"></div>
      <div className="drawer-content"></div>

      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-gray-200 shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Record Purchase</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Close</button>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <form className="mt-4 space-y-5" onSubmit={handleSubmit} noValidate>
          <fieldset className="space-y-3 border border-gray-200 rounded-lg p-3">
            <legend className="px-2 text-sm text-gray-600">Purchase Info</legend>
            <input className="input input-bordered w-full" placeholder="Car (preselected)" value={defaultCar?.title ?? ""} readOnly />
            <div className="grid grid-cols-2 gap-3">
              <input className="input input-bordered" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              <input className="input input-bordered" type="number" placeholder="Buy Price" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} />
            </div>
          </fieldset>

          <fieldset className="space-y-3 border border-gray-200 rounded-lg p-3">
            <legend className="px-2 text-sm text-gray-600">Payment</legend>
            <div className="grid grid-cols-2 gap-3">
              <select className="select select-bordered" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                <option value="Tunai">Tunai</option>
                <option value="Transfer">Transfer</option>
              </select>
              <input className="input input-bordered" placeholder="Vendor/Source" value={vendorSource} onChange={(e) => setVendorSource(e.target.value)} />
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