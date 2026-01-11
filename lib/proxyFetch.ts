// lib/proxyFetch.ts
import { auth } from "@clerk/nextjs/server";

export async function proxyFetch(
    url: string,
    options?: RequestInit
) {
    const { userId, getToken } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const token = await getToken();

    return fetch(url, {
        ...options,
        headers: {
            ...options?.headers,
            Authorization: `Bearer ${token}`,
        },
    });
}
