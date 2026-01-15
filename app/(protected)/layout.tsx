import { auth } from "@clerk/nextjs/server";
import Footer from "../_components/Footer";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (userId) {
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        
        fetch(`${baseUrl}/api/auth/sync-user`, {
            method: "POST",
            cache: "no-store",
        }).catch(() => { });
    }

    return (
        <>
            {children}
            <Footer />
        </>
    );
}
