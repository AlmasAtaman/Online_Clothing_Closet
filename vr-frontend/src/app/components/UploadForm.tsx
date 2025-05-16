"use client";

import React, { useRef, useState } from "react";
import axios from "axios";

export default function UploadForm({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [autoData, setAutoData] = useState({ name: "", type: "", brand: "" });
  const [submitting, setSubmitting] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const [cleanedFile, setCleanedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    try {
      await axios.post("http://localhost:8000/api/images/final-submit", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Clothing submitted!");

      // Reset
      setImage(null);
      setPreviewUrl(null);
      setAutoData({ name: "", type: "", brand: "" });
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
          className="w-full h-auto mb-4 rounded"
        />
      ) : null}

      <div className="space-y-2 mt-4">
        <input
          type="text"
          placeholder="Title"
          value={autoData.name}
          onChange={(e) =>
            setAutoData({ ...autoData, name: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Type (e.g. T-shirt)"
          value={autoData.type}
          onChange={(e) =>
            setAutoData({ ...autoData, type: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Brand (optional)"
          value={autoData.brand}
          onChange={(e) =>
            setAutoData({ ...autoData, brand: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />
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
