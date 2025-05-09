"use client"

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import LogOutButton from "../components/LogoutButton";
import InputFile from "../components/inputFile";
import ImageGallery from "../components/ImageGallery";
import { useRouter } from "next/navigation";

interface DecodedToken {
    id: number;
    username: string;
    email: string;
}

export default function Homepage(){
    const [ username, setUsername ] = useState<string | null >(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.push("/login");
            return;
        }

        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUsername(decoded.username);
            } catch (error) {
                console.error("Invalid Token", error);
                router.push("/login");
            }
        }
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Welcome, {username ? username : "Guest"}</h1>
                <LogOutButton />
            </div>
            <div className="mb-8">
                <InputFile />
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Images</h2>
                <ImageGallery />
            </div>
        </div>
    );
}


