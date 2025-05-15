"use client";

import React, { useRef, useState } from "react";
import axios from "axios";



export default function UploadForm() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [autoData, setAutoData] = useState({ name: "", type: "", brand: "" });
  const [submitting, setSubmitting] = useState(false);
  const [key, setKey] = useState<string | null>(null);
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
        const res = await axios.post("http://localhost:8000/images", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { key, clothingData } = res.data;
      setKey(key);
      console.log("Clothing data from backend:", clothingData);

      setAutoData({
        name: clothingData?.name || "",
        type: clothingData?.type || "",
        brand: clothingData?.brand || "",
      });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!image || !key) return alert("No image uploaded yet");

    try {
      await axios.post("http://localhost:8000/images/submit-clothing", {
        name: autoData.name,
        type: autoData.type,
        brand: autoData.brand,
        key,
      }, {
        withCredentials: true,
      });

      alert("Clothing submitted!");
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

      {previewUrl && (
        <img src={previewUrl} alt="Preview" className="w-full h-auto mb-4 rounded" />
      )}

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Title"
          value={autoData.name}
          onChange={(e) => setAutoData({ ...autoData, name: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Type (e.g. T-shirt)"
          value={autoData.type}
          onChange={(e) => setAutoData({ ...autoData, type: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Brand (optional)"
          value={autoData.brand}
          onChange={(e) => setAutoData({ ...autoData, brand: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleUpload}
          disabled={submitting || !image}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {submitting ? "Uploading..." : "Auto-fill"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!image}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
