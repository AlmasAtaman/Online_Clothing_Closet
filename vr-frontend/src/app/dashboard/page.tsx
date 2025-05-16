"use client"

import { useEffect, useState, useRef } from "react";
import LogOutButton from "../components/LogoutButton";
import UploadModal from "../components/UploadModal";
import { useRouter } from "next/navigation";
import ClothingGallery from "../components/ClothingGallery";



export default function Homepage(){
    const [ username, setUsername ] = useState<string | null >(null);
    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const galleryRef = useRef<any>(null);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch("http://localhost:8000/api/auth/me", {
                credentials: "include"
            });

            if (!res.ok) {
                router.push("/login");
            } else {
                const data = await res.json();
                setUsername(data.username); // check if /me route makes it correct
            }

            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (!hasMounted || loading) return null;


    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Welcome, {username ? username : "Guest"}</h1>
                <LogOutButton />
            </div>
            <div className="mb-8 text-right">
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                ➕ Add Clothing
            </button>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Images</h2>
                <ClothingGallery ref={galleryRef} />
            </div>

            <UploadModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onUploadComplete={() => {
                setShowModal(false);
                galleryRef.current?.refresh();
            }}
            />

        </div>
    );
}


