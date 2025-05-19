"use client";

import React, { useRef, useState } from "react";
import axios from "axios";


const initialData = {
    name: "",
    type: "",
    brand: "",
    occasion: "",
    style: "",
    fit: "",
    color: "",
    material: "",
    season: "",
    notes: "",
};


type ClothingFields = keyof typeof initialData;


export default function UploadForm({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [mode, setMode] = useState<"basic" | "advanced">("basic");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const [cleanedFile, setCleanedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [autoData, setAutoData] = useState<typeof initialData>(initialData);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image");

    const formData = new FormData();
    formData.append("image", image);

    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:8000/api/images", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { clothingData, imageBuffer, originalname } = res.data;

      if (!clothingData?.isClothing) {
        alert("This image doesn’t look like clothing. Try a different image.");
        return;
      }
      console.log("Gemini autofill data:", clothingData);
      setAutoData((prev) => ({
        ...prev,
        name: clothingData?.name ?? prev.name,
        type: clothingData?.type ?? prev.type,
        brand: clothingData?.brand ?? prev.brand,
        occasion: clothingData?.occasion ?? prev.occasion,
        style: clothingData?.style ?? prev.style,
        fit: clothingData?.fit ?? prev.fit,
        color: clothingData?.color ?? prev.color,
        material: clothingData?.material ?? prev.material,
        season: clothingData?.season ?? prev.season,
        notes: "",
      }));


      // Decode base64 string into binary
      const binary = atob(imageBuffer);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Create a File object from buffer
      const blob = new Blob([bytes], { type: "image/jpeg" });
      const file = new File([blob], originalname, { type: "image/jpeg" });
      setCleanedFile(file);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!cleanedFile) return alert("No cleaned image to submit.");

    const formData = new FormData();
    formData.append("image", cleanedFile);
    formData.append("name", autoData.name);
    formData.append("type", autoData.type);
    formData.append("brand", autoData.brand);

    if (mode === "advanced") {
      ["occasion", "style", "fit", "color", "material", "season", "notes"].forEach((field) => {
        formData.append(field, autoData[field as keyof typeof autoData] || "");
      });
    }

    try {
      await axios.post("http://localhost:8000/api/images/final-submit", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Clothing submitted!");

      // Reset
      setImage(null);
      setPreviewUrl(null);
      setAutoData(initialData);
      setCleanedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      if (onUploadComplete) onUploadComplete();

    } catch (err) {
      console.error("Submit failed", err);
      alert("Submit failed");
    }
  };


  return (
    <div className="border p-4 rounded-xl max-w-md mx-auto">

      <div className="mb-3 flex items-center gap-4">
      <span className="text-sm font-medium">Upload Mode:</span>
      <button
        onClick={() => setMode(mode === "basic" ? "advanced" : "basic")}
        className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 text-sm shadow"
      >
        {mode === "basic" ? "Switch to Advanced Mode" : "Switch to Basic Mode"}
      </button>
    </div>
      <label className="block w-full cursor-pointer mb-2 text-white text-sm font-medium">
        <input
          type="file"
          ref={inputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </label>

      {mode === "advanced" ? (
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          {/* Image Preview Left */}
          {previewUrl && (
            <div className="flex-1 max-w-sm">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full object-contain rounded border"
              />
            </div>
          )}

          {/* Form Fields Right */}
          <div className="flex-1 space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={autoData.name}
              onChange={(e) => setAutoData({ ...autoData, name: e.target.value })}
              className="w-full border px-3 py-3 rounded text-lg"
            />
            <div className="grid grid-cols-2 gap-2">
              {["type", "brand", "occasion", "style", "fit", "color", "material", "season"].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={autoData[field as keyof typeof autoData] || ""}
                  onChange={(e) =>
                    setAutoData({
                      ...autoData,
                      [field]: e.target.value,
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                />
              ))}
            </div>

            <textarea
              placeholder="Notes (optional)"
              value={autoData.notes}
              onChange={(e) => setAutoData({ ...autoData, notes: e.target.value })}
              className="w-full border px-3 py-2 rounded h-24"
            />
          </div>
        </div>
      ) : (
        <>
          {/* BASIC Mode */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-80 object-contain mb-4 rounded"
            />
          )}

          <div className="space-y-2 mt-4">
            {["name", "type", "brand"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={autoData[field as ClothingFields]}
                onChange={(e) =>
                  setAutoData((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
                className="w-full border px-3 py-2 rounded"
              />
            ))}
          </div>
        </>
      )}


      <div className="flex gap-4 mt-4">
        <button
          onClick={handleUpload}
          disabled={submitting || !image}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? "Uploading..." : "Auto-fill"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!cleanedFile || !autoData.name || !autoData.type}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );

}
