"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Aperture } from "lucide-react";

interface ImageUploaderProps {
  onImageSelected: (file: File | null) => void;
}

export function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Maximum size is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden group bg-radar-grid"
          style={{
            backgroundColor: "var(--bg-nested)",
            borderColor: isDragging ? "var(--accent-icon)" : "var(--border-color)"
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center pt-5 pb-6 transition-colors">
            <div 
              className="w-12 h-12 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)"
              }}
            >
              <UploadCloud className="w-6 h-6" style={{ color: "var(--accent-icon)" }} />
            </div>
            <p className="mb-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              <span className="underline decoration-dotted" style={{ color: "var(--accent-icon)" }}>Click to upload</span> or drag and drop
            </p>
            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>JPG, PNG or WebP (Max. 10MB)</p>
          </div>
        </div>
      ) : (
        <div 
          className="relative rounded-2xl overflow-hidden group border shadow-2xl animate-in fade-in zoom-in-95 duration-300"
          style={{
            backgroundColor: "var(--bg-nested)",
            borderColor: "var(--border-color)"
          }}
        >
          <Image unoptimized width={800} height={600} src={preview} alt="Evidence preview" className="w-full h-auto max-h-[400px] object-contain" />
          
          <div 
            className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono backdrop-blur-md border"
            style={{
              backgroundColor: "var(--bg-badge)",
              borderColor: "var(--border-badge)",
              color: "var(--text-primary)"
            }}
          >
            <Aperture className="w-3.5 h-3.5" style={{ color: "var(--accent-icon-2)" }} />
            <span>Frame ready for analysis</span>
          </div>

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={clearImage}
              className="bg-red-500/90 text-white rounded-full p-3 hover:bg-red-600 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg"
              title="Remove image"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
