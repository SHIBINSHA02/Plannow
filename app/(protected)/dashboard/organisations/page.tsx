import OrganisationsClient from "./_components/OrganisationsClient";
import { Sparkles, Activity, Layers } from "lucide-react";

export default function OrganisationPage() {
    return (
        <main className="min-h-screen bg-[#FBFBFC] text-slate-800 antialiased overflow-y-scroll hide-scrollbar">
       
            {/* 2. Focused Header Section */}
            <header className=" mx-auto px-6 pt-12 pb-8 border border-blue-600 rounded-3xl m-3">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-3">
                        <h1 className="text-3xl font-light tracking-tight text-slate-900">
                            Organization <span className="text-blue-600 font-normal">Dashboard</span>
                        </h1>
                        <p className="text-slate-500 leading-relaxed max-w-md font-light">
                            "Efficiency is doing things right; effectiveness is doing the right things."
                        </p>
                    </div>

                   
                    

                        
                   
                 
                </div>
            </header>

            {/* 3. Content Area */}
            <section className=" mx-auto px-6 pb-20">
           
                    <OrganisationsClient />
               
            </section>
        </main>
    );
}