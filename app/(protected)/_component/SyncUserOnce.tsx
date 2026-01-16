"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SyncUserOnce() {
    const { isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        fetch("/api/auth/sync-user", {
            method: "POST",
        });
    }, [isLoaded, isSignedIn]);

    return null;
}
