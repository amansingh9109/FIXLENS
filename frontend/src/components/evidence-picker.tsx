"use client";

import { useEffect, useState } from "react";

export default function EvidencePicker({ file, onChange, disabled = false, label = "Add evidence image" }: {
  file: File | null; onChange: (file: File | null) => void; disabled?: boolean; label?: string;
}) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
    return () => { reader.onload = null; reader.abort(); };
  }, [file]);
  return <div>
    <label className="mb-3 block font-medium">{label}
      <input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled}
        className="mt-3 block w-full rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600 file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-stone-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-100"
        onChange={event => {
          const selected = event.target.files?.[0] || null;
          const message = selected && !["image/jpeg", "image/png", "image/webp"].includes(selected.type)
            ? "Please upload a JPEG, PNG, or WebP image."
            : selected && selected.size > 10 * 1024 * 1024 ? "Image exceeds the 10 MB limit."
            : selected && !selected.size ? "Image is empty." : "";
          setError(message); onChange(message ? null : selected);
          if (message) event.target.value = "";
        }} />
    </label>
    <p className="mt-2 text-xs text-stone-500">JPEG, PNG, or WebP. Up to 10 MB. A well-lit close-up works best.</p>
    {error && <p role="alert" className="notice-error mt-3">{error}</p>}
    {file && preview && <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt="Selected evidence preview" className="mt-4 max-h-64 rounded-md object-contain" />
      <p className="mt-2 text-xs text-stone-500">{file.name}</p>
    </>}
  </div>;
}
