"use client"

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function LoginPage(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const checkUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("http://localhost:8000/api/auth/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Signup failed.");
            return;
        }

        localStorage.setItem("accessToken", data.accessToken);
        console.log(`User ${username} logged in`);
        router.push("/dashboard");
    }



    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <Link href = "..">
            <button className="bg-blue-600 rounded px-6  py -3">Go Back</button>
        </Link>

        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Signup Page</h1>
            <form onSubmit={checkUser}>
                <h2>Username</h2>
                <input type="text" className="bg-white rounded text-black" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}  />
                <h2>Password</h2>
                <input type="text" className="bg-white rounded text-black" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}  />
                <br />
                <button type="submit" className="bg-blue-600 rounded px-6  py -3">Submit</button>
            </form>
        </main>
      </div>
        
    );
};