"use client"

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import LogOutButton from "../components/LogoutButton";
import InputFile from "../components/inputFile";

interface DecodedToken {
    id: number;
    username: string;
    email: string;
}



export default function Homepage(){
    const [ username, setUsername ] = useState<string | null >(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUsername(decoded.username);
            } catch (error) {
                console.error("Invalid Token", error);
            }
        }
    }, []);


    return (
        <div>
            <h1>Yo {username ? username : "Guest"}</h1>
            <LogOutButton />
            <InputFile />
        </div>
    );

}


