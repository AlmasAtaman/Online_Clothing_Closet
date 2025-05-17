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

      setAutoData({
        name: clothingData.name || "",
        type: clothingData.type || "",
        brand: clothingData.brand || "",
        occasion: clothingData.occasion || "",
        style: clothingData.style || "",
        fit: clothingData.fit || "",
        color: clothingData.color || "",
        material: clothingData.material || "",
        season: clothingData.season || "",
        notes: "",
      });


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
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
      >
        {mode === "basic" ? "Switch to Advanced" : "Switch to Basic"}
      </button>
    </div>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="mb-2"
      />

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full max-h-80 object-contain mb-4 rounded"
        />
      ) : null}

      <div className="space-y-2 mt-4">
        {["name", "type", "brand"].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={autoData[field as keyof typeof autoData]}
            onChange={(e) =>
              setAutoData((prev) => ({
                ...prev,
                [field]: e.target.value,
              }))
            }
            className="w-full border px-3 py-2 rounded"
          />
        ))}

        {mode === "advanced" &&
          ["occasion", "style", "fit", "color", "material", "season", "notes"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={autoData[field as keyof typeof autoData]}
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
