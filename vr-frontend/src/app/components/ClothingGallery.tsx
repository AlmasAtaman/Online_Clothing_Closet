"use client";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import Fuse from "fuse.js";



type Clothing = {
  key: string;
  url: string;
  name: string;
  type: string;
  brand: string;
  occasion?: string;
  style?: string;
  fit?: string;
  color?: string;
  material?: string;
  season?: string;
  notes?: string;
};


const ClothingGallery = forwardRef((props, ref) => {
  const [clothingItems, setClothingItems] = useState<Clothing[]>([]);
  const [selectedItem, setSelectedItem] = useState<Clothing | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    brand: "",
    occasion: "",
    style: "",
    fit: "",
    color: "",
    material: "",
    season: "",
    notes: ""
  });

  


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


  const toggleTag = (tag: string) => {
  setSelectedTags((prev) =>
    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const fuse = new Fuse(clothingItems, {
    keys: [
      "name", "type", "brand",
      "occasion", "style", "fit",
      "color", "material", "season"
    ],
    threshold: 0.3,
  });

  const searchResults = searchQuery
    ? fuse.search(searchQuery).map(result => result.item)
    : clothingItems;

  const filteredItems = searchResults.filter((item) => {
    if (selectedTags.length === 0) return true;
    const itemTags = [
      item.type,
      item.occasion,
      item.style,
      item.fit,
      item.color,
      item.material,
      item.season,
    ].filter(Boolean);
    return selectedTags.every((tag) => itemTags.includes(tag));
  });


  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Your Closet</h2>
      {clothingItems.length === 0 && (
        <p className="text-gray-500 text-center col-span-full">Your closet is empty. Upload something!</p>
        )}
      {selectedTags.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {selectedTags.map((tag) => (
            <div
              key={tag}
              className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm"
            >
              <span>{tag}</span>
              <button
                onClick={() => toggleTag(tag)}
                className="ml-2 text-red-500 font-bold focus:outline-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or tag..."
          value={searchQuery}
          onChange={(e) => {
            const input = e.target.value;
            setSearchQuery(input);

            if (autocompleteEnabled && input) {
              const results = fuse.search(input).map(r => r.item.name);
              const unique = [...new Set(results)].slice(0, 5); // top 5
              setSuggestions(unique);
            } else {
              setSuggestions([]);
            }
          }}
          className="w-full p-2 rounded border border-gray-300 text-white bg-gray-900 placeholder-gray-400"
        />
      </div>

      <div className="flex justify-between items-center mt-1 mb-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autocompleteEnabled}
            onChange={(e) => setAutocompleteEnabled(e.target.checked)}
          />
          <span className="text-sm text-gray-700">Enable Autocomplete</span>
        </label>
      </div>

      {autocompleteEnabled && suggestions.length > 0 && (
        <ul className="mb-4 bg-white border border-gray-300 rounded shadow text-sm text-black max-h-40 overflow-y-auto">
          {suggestions.map((sug, i) => (
            <li
              key={i}
              className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSearchQuery(sug);
                setSuggestions([]);
              }}
            >
              {sug}
            </li>
          ))}
        </ul>
      )}



      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredItems.length === 0 ? (
        <p className="text-center text-gray-500 col-span-full">No results found.</p>
      ) : (
        filteredItems.map((item, index) => (
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
            <div className="mt-2 flex flex-wrap gap-1">
              {[item.type, item.occasion, item.style, item.fit, item.color, item.material, item.season]
                .filter((tag): tag is string => Boolean(tag))
                .map((tag) => (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTag(tag);
                    }}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      selectedTags.includes(tag)
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
            </div>
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
        ))
      )}



      {selectedItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 text-white"
            onClick={() => {
              setSelectedItem(null);
              setIsEditing(false);
            }}
          >
            <div
              className="relative bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Left Arrow */}
            {!isEditing && (
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 text-3xl px-4 text-white hover:text-gray-400 z-10"
                onClick={() => {
                  const currentIndex = clothingItems.findIndex(item => item.key === selectedItem.key);
                  if (currentIndex > 0) setSelectedItem(clothingItems[currentIndex - 1]);
                }}
              >
                ❮
              </button>
            )}


            {/* Right Arrow */}
            {!isEditing && (
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
            )}


            {/* Image Section */}
            <div className="w-1/2 bg-gray-800 p-4 flex justify-center items-center border-r border-gray-700">
              <img src={selectedItem.url} alt={selectedItem.name} className="max-h-[400px] rounded-lg" />
            </div>

            {/* Info Section */}
            <div className="w-1/2 p-6 flex flex-col justify-between max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
              {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Type"
                    />
                    <input
                      type="text"
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Brand"
                    />
                    <input
                      type="text"
                      value={editForm.occasion}
                      onChange={(e) => setEditForm({ ...editForm, occasion: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Occasion"
                    />
                    <input
                      type="text"
                      value={editForm.style}
                      onChange={(e) => setEditForm({ ...editForm, style: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Style"
                    />
                    <input
                      type="text"
                      value={editForm.fit}
                      onChange={(e) => setEditForm({ ...editForm, fit: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Fit"
                    />
                    <input
                      type="text"
                      value={editForm.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Color"
                    />
                    <input
                      type="text"
                      value={editForm.material}
                      onChange={(e) => setEditForm({ ...editForm, material: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Material"
                    />
                    <input
                      type="text"
                      value={editForm.season}
                      onChange={(e) => setEditForm({ ...editForm, season: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Season"
                    />
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                      placeholder="Notes"
                      rows={3}
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          const updated = { ...selectedItem, ...editForm };
                          try {
                            const cleanKey = selectedItem.key; 

                            console.log("Clean key:", cleanKey);

                            await axios.patch(
                              "http://localhost:8000/api/images/update",
                              { key: cleanKey, ...editForm },
                              { withCredentials: true }
                            );


                            setSelectedItem(updated);
                            setClothingItems(prev =>
                              prev.map(item => item.key === updated.key ? updated : item)
                            );
                            setIsEditing(false);
                          } catch (err) {
                            console.error("Failed to update clothing item:", err);
                            alert("Failed to save changes.");
                          }
                        }}
                        className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

              ) : (
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold mb-2">{selectedItem.name}</h2>
                  <p><strong>Type:</strong> {selectedItem.type}</p>
                  <p><strong>Brand:</strong> {selectedItem.brand}</p>
                  {selectedItem.occasion && <p><strong>Occasion:</strong> {selectedItem.occasion}</p>}
                  {selectedItem.style && <p><strong>Style:</strong> {selectedItem.style}</p>}
                  {selectedItem.fit && <p><strong>Fit:</strong> {selectedItem.fit}</p>}
                  {selectedItem.color && <p><strong>Color:</strong> {selectedItem.color}</p>}
                  {selectedItem.material && <p><strong>Material:</strong> {selectedItem.material}</p>}
                  {selectedItem.season && <p><strong>Season:</strong> {selectedItem.season}</p>}
                  {selectedItem.notes && <p><strong>Notes:</strong> {selectedItem.notes}</p>}
                </div>

              )}

                <div className="mt-6 flex gap-2">
                  <button
                    className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                      setIsEditing(true);
                      setEditForm({
                        name: selectedItem.name,
                        type: selectedItem.type,
                        brand: selectedItem.brand,
                        occasion: selectedItem.occasion || "",
                        style: selectedItem.style || "",
                        fit: selectedItem.fit || "",
                        color: selectedItem.color || "",
                        material: selectedItem.material || "",
                        season: selectedItem.season || "",
                        notes: selectedItem.notes || "",
                      });
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={async () => {
                      const confirmDelete = confirm("Are you sure you want to delete this item?");
                      if (!confirmDelete) return;
                      try {
                        await axios.delete(
                          `http://localhost:8000/api/images/${encodeURIComponent(selectedItem.key)}`,
                          { withCredentials: true }
                        );
                        setClothingItems((prev) => prev.filter((item) => item.key !== selectedItem.key));
                        setSelectedItem(null);
                      } catch (err) {
                        console.error("Error deleting item:", err);
                        alert("Failed to delete item.");
                      }
                    }}
                  >
                    Delete
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