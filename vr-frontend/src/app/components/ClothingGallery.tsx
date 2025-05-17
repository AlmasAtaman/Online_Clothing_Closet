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
  const [selectedItem, setSelectedItem] = useState<Clothing | null>(null);
  


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
          <div
            key={item.key || item.url || index}
            className="border rounded p-3 shadow cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
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
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.key);
              }}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
      ))}


      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 text-white">
          <div className="relative flex bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">

            {/* Left Arrow */}
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-3xl px-4 text-white hover:text-gray-400 z-10"
              onClick={() => {
                const currentIndex = clothingItems.findIndex(item => item.key === selectedItem.key);
                if (currentIndex > 0) setSelectedItem(clothingItems[currentIndex - 1]);
              }}
            >
              ❮
            </button>

            {/* Right Arrow */}
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-3xl px-4 text-white hover:text-gray-400 z-10"
              onClick={() => {
                const currentIndex = clothingItems.findIndex(item => item.key === selectedItem.key);
                if (currentIndex < clothingItems.length - 1)
                  setSelectedItem(clothingItems[currentIndex + 1]);
              }}
            >
              ❯
            </button>

            {/* Image Section */}
            <div className="w-1/2 bg-gray-800 p-4 flex justify-center items-center border-r border-gray-700">
              <img src={selectedItem.url} alt={selectedItem.name} className="max-h-[400px] rounded-lg" />
            </div>

            {/* Info Section */}
            <div className="w-1/2 p-6 flex flex-col justify-between">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
              <div>
                <h2 className="text-2xl font-semibold mb-2">{selectedItem.name}</h2>
                <p className="mb-1"><strong>Type:</strong> {selectedItem.type}</p>
                <p className="mb-1"><strong>Brand:</strong> {selectedItem.brand}</p>
              </div>
              <div className="mt-6">
                <button className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      </div>
    </div>
  );
})


export default ClothingGallery;