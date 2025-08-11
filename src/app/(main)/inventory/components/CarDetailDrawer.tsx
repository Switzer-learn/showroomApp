"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  car?: {
    id: string;
    merk?: string;
    model?: string;
    tahun?: number;
    plat_nomor?: string;
    warna?: string;
    transmisi?: string;
    bahan_bakar?: string;
    kilometer?: number;
    harga_beli?: number;
    harga_jual?: number;
    deskripsi?: string;
    image_url?: string;
  } | null;
};

export default function CarDetailDrawer({ open, onClose, car }: Props) {
  if (!open) return null;

  return (
    <div className="drawer drawer-end drawer-open z-50">
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-side pointer-events-none"></div>
      <div className="drawer-content"></div>

      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white border-l border-gray-200 shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Car Details</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Close</button>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <div className="aspect-video rounded-md border border-gray-200 bg-gray-50 grid place-items-center overflow-hidden">
              {car?.image_url ? (
                <img src={car.image_url} alt="car" className="object-contain h-full w-full p-4" />
              ) : (
                <span className="text-gray-400 text-sm">No Image</span>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border border-gray-200 p-3 bg-white">
              <div className="text-gray-900 font-medium">{car?.merk} {car?.model} {car?.tahun ?? ""}</div>
              <div className="text-xs text-gray-600 mt-1">Plat: {car?.plat_nomor ?? "-"}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <InfoItem label="Warna" value={car?.warna} />
              <InfoItem label="Transmisi" value={car?.transmisi} />
              <InfoItem label="Bahan Bakar" value={car?.bahan_bakar} />
              <InfoItem label="Kilometer" value={car?.kilometer?.toLocaleString("id-ID")} />
              <InfoItem label="Harga Beli" value={formatIDR(car?.harga_beli)} />
              <InfoItem label="Harga Jual" value={formatIDR(car?.harga_jual)} />
            </div>

            <div className="rounded-lg border border-gray-200 p-3 bg-white">
              <div className="text-xs text-gray-500">Deskripsi</div>
              <div className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{car?.deskripsi ?? "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 bg-white">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-sm text-gray-900 mt-0.5">{value ?? "-"}</div>
    </div>
  );
}

function formatIDR(n?: number | null) {
  if (!n && n !== 0) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}