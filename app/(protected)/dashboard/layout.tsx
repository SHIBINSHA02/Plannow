import Sidebar from "../_component/SideMenu";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
           
            <Sidebar />

        
            <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
