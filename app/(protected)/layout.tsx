import SyncUserOnce from "./_component/SyncUserOnce";
import Footer from "../_components/Footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SyncUserOnce />
            {children}
            <Footer />
        </>
    );
}
