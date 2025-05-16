"use client";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";


type Clothing = {
  key: string;
  url: string;
  name: string;
  type: string;
  brand: string;
};

const ClothingGallery = forwardRef((props, ref) => {
  const [clothingItems, setClothingItems] = useState<Clothing[]>([]);

    const fetchImages = async () => {
    try {
        const res = await axios.get("http://localhost:8000/api/images", {
          withCredentials: true,
        });
        console.log("response data", res.data);
        setClothingItems(res.data.clothingItems || []);
        console.log("First clothing item:", res.data.clothingItems?.[0]);

    } catch (err) {
        console.error("Error fetching images:", err);
    }
    };

    const handleDelete = async (key: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/images/${encodeURIComponent(key)}`, {
        withCredentials: true,
      });
        setClothingItems((prev) => prev.filter((item) => item.key !== key));
    } catch (err) {
        console.error("Error deleting image:", err);
    }
    };

    useImperativeHandle(ref, () => ({
    refresh: fetchImages,
    }), []);

    useEffect(() => {
    fetchImages();
    }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Your Closet</h2>
      {clothingItems.length === 0 && (
        <p className="text-gray-500 text-center col-span-full">Your closet is empty. Upload something!</p>
        )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.isArray(clothingItems) &&
        clothingItems.map((item, index) => (
        <div key={item.key || item.url || index} className="border rounded p-3 shadow">
            {item.url ? (
              <img src={item.url} alt={item.name} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                No Image
              </div>
            )}
            <p className="font-medium mt-2">{item.name}</p>
            <p className="text-sm text-gray-600">{item.type}</p>
            <p className="text-sm text-gray-600">{item.brand}</p>
            <button
            onClick={() => handleDelete(item.key)}
            className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
            Delete
            </button>
        </div>
        ))}
      </div>
    </div>
  );
})


export default ClothingGallery;