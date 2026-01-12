import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth(); 

    if (userId) {
        // fire-and-forget (server-safe)
        fetch("/api/auth/sync-user", { cache: "no-store" });
    }

    return <>{children}</>;
}
