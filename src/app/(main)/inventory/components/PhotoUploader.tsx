"use client";

import { useRef, useState } from "react";
import { uploadAttachment, storagePublicUrl, setCarImageUrl } from "@/app/lib/dbFunction";

type Props = {
  open: boolean;
  onClose: () => void;
  carId: string | null;
  onUploaded?: (urls: string[]) => void;
  setAsMainImage?: boolean; // if true, set first uploaded image as main
};

export default function PhotoUploader({ open, onClose, carId, onUploaded, setAsMainImage = true }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const onPickFiles = () => {
    inputRef.current?.click();
  };

  const onChangeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []);
    // Prevent duplicates by name + size
    const existing = new Set(files.map((x) => `${x.name}:${x.size}`));
    const unique = f.filter((x) => !existing.has(`${x.name}:${x.size}`));
    setFiles((prev) => [...prev, ...unique]);
  };

  const onRemove = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onUpload = async () => {
    if (!carId || files.length === 0) {
      onClose();
      return;
    }
    try {
      setError(null);
      setUploading(true);

      // Upload sequentially to keep order; could be Promise.all if not required
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `cars/${carId}/${safeName}`;
        await uploadAttachment(file, path);
        const publicUrl = await storagePublicUrl(path);
        uploadedUrls.push(publicUrl);
      }

      // Set the first image as main if requested
      if (setAsMainImage && uploadedUrls.length > 0) {
        try {
          await setCarImageUrl(carId, uploadedUrls[0]);
        } catch (e) {
          // Non-fatal; still proceed
          console.error("Failed to set main image:", e);
        }
      }

      onUploaded?.(uploadedUrls);
      setFiles([]);
      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="drawer drawer-end drawer-open z-50">
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-side pointer-events-none"></div>
      <div className="drawer-content"></div>

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-gray-200 shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upload Photos</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Close</button>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={onChangeFiles}
        />

        <div className="mt-4 space-y-3">
          <button type="button" className="btn btn-outline" onClick={onPickFiles} aria-label="Choose image files">Choose Files</button>

          {files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between border border-gray-200 rounded-md p-2">
                  <div className="truncate text-sm text-gray-800">{f.name}</div>
                  <button onClick={() => onRemove(i)} className="btn btn-ghost btn-xs" aria-label={`Remove ${f.name}`}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No files selected</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn">Cancel</button>
          <button disabled={uploading || files.length === 0} onClick={onUpload} className="btn btn-primary">
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}