"use client"

import { useEffect, useState } from "react";
import LogOutButton from "../components/LogoutButton";
import UploadForm from "../components/UploadForm";
import ImageGallery from "../components/ImageGallery";
import { useRouter } from "next/navigation";



export default function Homepage(){
    const [ username, setUsername ] = useState<string | null >(null);
    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

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
            <div className="mb-8">
                <UploadForm />
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Images</h2>
                <ImageGallery />
            </div>
        </div>
    );
}


