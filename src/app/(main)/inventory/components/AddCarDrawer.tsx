"use client";

import { useMemo, useState } from "react";
import { carFormSchema } from "@/app/schemas/carValidation";
import { createCar, uploadAttachment, storagePublicUrl, setCarImageUrl } from "@/app/lib/dbFunction";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (carId: string) => void;
};

type FormState = {
  merk: string;
  model: string;
  series: string;
  tahun: number | "";
  plat_nomor: string;
  nomor_rangka: string;
  nomor_mesin: string;
  harga_beli: number | "";
  harga_jual: number | "";
  deskripsi: string;
};

export default function AddCarDrawer({ open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    merk: "",
    model: "",
    series: "",
    tahun: "",
    plat_nomor: "",
    nomor_rangka: "",
    nomor_mesin: "",
    harga_beli: "",
    harga_jual: "",
    deskripsi: "",
  });

  // Local image selection state (multi-image)
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onPickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const existing = new Set(images.map((x) => `${x.name}:${x.size}`));
    const unique = files.filter((x) => !existing.has(`${x.name}:${x.size}`));
    setImages((prev) => [...prev, ...unique]);
  };

  const onRemoveImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const canSubmit = useMemo(() => {
    return !!form.merk && !!form.model && !!form.tahun && !!form.plat_nomor && !!form.harga_beli;
  }, [form]);

  if (!open) return null;

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: e.target.type === "number" ? (v === "" ? "" : Number(v)) : v,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form", form);
    setErrors({});
    try {
      setLoading(true);

      // Map to validation candidate expected by carFormSchema
      const candidate = {
        merk: form.merk,
        tipe: form.series || "Standard",
        model: form.model,
        series: form.series || "",
        body_type: "MPV",
        variation: "",
        tahun: typeof form.tahun === "number" ? form.tahun : 0,
        plat_nomor: form.plat_nomor,
        warna: "Hitam",
        transmisi: "Manual",
        bahan_bakar: "Bensin",
        kondisi: "Baik",
        kilometer: 0,
        previous_owners: 1,
        registration_expiry: "",
        harga_beli: typeof form.harga_beli === "number" ? form.harga_beli : 0,
        harga_jual: typeof form.harga_jual === "number" ? form.harga_jual : 0,
        tanggal_beli: new Date().toISOString().slice(0, 10),
        deskripsi: form.deskripsi || "",
        status: "Tersedia" as const,
      };

      const parsed = carFormSchema.safeParse(candidate);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.issues.forEach((iss) => {
          const key = (iss.path?.[0] as string) ?? "form";
          if (!fieldErrors[key]) fieldErrors[key] = iss.message;
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      // Persist via server wrapper (using new cars schema keys)
      const created = await createCar({
        merk: candidate.merk,
        tipe: candidate.tipe,
        model: candidate.model,
        series: candidate.series,
        body_type: candidate.body_type,
        variation: candidate.variation,
        tahun: candidate.tahun,
        plat_nomor: candidate.plat_nomor,
        warna: candidate.warna,
        transmisi: candidate.transmisi,
        bahan_bakar: candidate.bahan_bakar,
        kondisi: candidate.kondisi,
        kilometer: candidate.kilometer,
        previous_owners: candidate.previous_owners,
        registration_expiry: candidate.registration_expiry || null,
        buy_price: candidate.harga_beli,
        sell_price_cash: candidate.harga_jual,
        description: candidate.deskripsi,
        status: "available",
        vin: form.nomor_rangka || null,
        engine_no: form.nomor_mesin || null,
      });

      // If images selected, upload them to "gambar-mobil" under cars/{carId}/
      if (images.length > 0 && created?.id) {
        setUploading(true);
        const uploadedUrls: string[] = [];
        for (const file of images) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `cars/${created.id}/${safeName}`;
          await uploadAttachment(file, path);
          const publicUrl = await storagePublicUrl(path);
          uploadedUrls.push(publicUrl);
        }
        // Set main image to the first uploaded (non-fatal if fails)
        try {
          if (uploadedUrls[0]) {
            await setCarImageUrl(created.id as string, uploadedUrls[0]);
          }
        } catch (e) {
          console.error("Failed to set main image:", e);
        } finally {
          setUploading(false);
        }
      }

      // Trigger hook for caller if needed
      try {
        onCreated?.(created.id as string);
      } finally {
        onClose();
      }
    } catch (err: any) {
      setErrors((e) => ({ ...e, form: err?.message ?? "Failed to save car" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer drawer-end drawer-open z-50 text-white">
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-side pointer-events-none"></div>
      <div className="drawer-content"></div>
      <div id="add-car-drawer" className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-gray-200 shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Car</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Close</button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {errors.form}
            </div>
          )}

        <div className="grid grid-cols-1 gap-3">
            <input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Merk" value={form.merk} onChange={handleChange("merk")} />
            {errors.merk && <p className="text-xs text-red-600">{errors.merk}</p>}

            <input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Model" value={form.model} onChange={handleChange("model")} />
            {errors.model && <p className="text-xs text-red-600">{errors.model}</p>}

            <div className="grid grid-cols-2 gap-3">
              <input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Type/Series" value={form.series} onChange={handleChange("series")} />
              <input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Year" type="number" value={form.tahun} onChange={handleChange("tahun")} />
            </div>
            {errors.tahun && <p className="text-xs text-red-600">{errors.tahun}</p>}

            <input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nomor Plat" value={form.plat_nomor} onChange={handleChange("plat_nomor")} />
            {errors.plat_nomor && <p className="text-xs text-red-600">{errors.plat_nomor}</p>}

            <input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nomor Rangka" value={form.nomor_rangka} onChange={handleChange("nomor_rangka")} />
            <input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nomor Mesin" value={form.nomor_mesin} onChange={handleChange("nomor_mesin")} />

            <div className="grid grid-cols-2 gap-3">
              <input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Buy Price" type="number" value={form.harga_beli} onChange={handleChange("harga_beli")} />
              <input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Sell Price (Cash)" type="number" value={form.harga_jual} onChange={handleChange("harga_jual")} />
            </div>
            {errors.harga_beli && <p className="text-xs text-red-600">{errors.harga_beli}</p>}
            {errors.harga_jual && <p className="text-xs text-red-600">{errors.harga_jual}</p>}

            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Description" rows={3} value={form.deskripsi} onChange={handleChange("deskripsi")} />

            {/* Inline multi image uploader (stored after car created) */}
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
              <input type="file" accept="image/*" multiple onChange={onPickImages} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              {images.length > 0 && (
                <ul className="mt-2 space-y-2 text-black">
                  {images.map((f, i) => (
                    <li key={i} className="flex items-center justify-between border border-gray-200 rounded-md p-2 text-sm">
                      <span className="truncate">{f.name}</span>
                      <button type="button" className="btn btn-ghost btn-xs" onClick={() => onRemoveImage(i)} aria-label={`Remove ${f.name}`}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {uploading && <p className="text-xs text-gray-500 mt-1">Uploading images...</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button disabled={loading || !canSubmit} className="btn btn-primary">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}