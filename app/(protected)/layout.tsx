// app/(protected)/layout.tsx
import SyncUserOnce from "./_component/SyncUserOnce";
import Footer from "../_components/Footer";
import { ThemeProvider } from "../theme-provider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SyncUserOnce />
            <ThemeProvider>
            {children}
            </ThemeProvider>
            <Footer />
        </>
    );
}
