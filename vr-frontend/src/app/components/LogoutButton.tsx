"use client"
import { useRouter } from "next/navigation";


export default function LogOutButton() {
    const router = useRouter();
    
    const handleLogout = async () => {
        localStorage.removeItem("accessToken");
        router.push("..");
    };

    return <button onClick={handleLogout} className="bg-blue-600 px-4 py-2 rounded">Logout</button>
}