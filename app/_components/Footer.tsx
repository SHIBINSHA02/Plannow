// app/_components/Footer.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Heart } from "lucide-react";
import { useTheme } from "next-themes";

const Footer: React.FC = () => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Return null or a skeleton until mounted to prevent hydration flicker
    if (!mounted) return null;

    return (
        <footer className="pt-32 pb-16 relative overflow-hidden bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
            {/* Ethereal Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-blue-200 to-transparent opacity-50" />
            <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="px-6 mx-auto max-w-7xl relative z-10">
                <div className="grid grid-cols-1 gap-16 md:grid-cols-4 lg:grid-cols-5">

                    {/* Brand */}
                    <div className="md:col-span-2 lg:col-span-2 space-y-8 pr-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
                                <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-2xl font-light tracking-tight text-gray-800 dark:text-white">Plannow</span>
                        </div>
                        <p className="text-gray-400 dark:text-slate-400 font-light leading-relaxed hover:text-gray-500 dark:hover:text-slate-300 transition-colors duration-500">
                            Designing the future of institutional orchestration. Seamless, intelligent, and beautifully human.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 font-light tracking-wide">
                            <span>Crafted with</span>
                            <Heart className="w-3.5 h-3.5 text-blue-300 fill-blue-100 animate-pulse" />
                            <span>at Marian Engineering College</span>
                        </div>
                    </div>

                    {/* Links - Mapping helper */}
                    {[
                        { title: 'Product', links: ['Ecosystem', 'Intelligence', 'Integration', 'Updates'] },
                        { title: 'Support', links: ['Documentation', 'Connect', 'Resources', 'Network Status'] },
                        { title: 'Legal', links: ['Privacy Directive', 'Terms of Service', 'Cookie Declaration'] }
                    ].map((section) => (
                        <div key={section.title} className="space-y-8">
                            <h3 className="text-xs font-light text-gray-900 dark:text-white uppercase tracking-[0.2em]">{section.title}</h3>
                            <ul className="space-y-5">
                                {section.links.map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 dark:text-slate-400 font-light hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="pt-16 mt-16 border-t border-gray-100/50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-gray-400 dark:text-slate-500 font-light tracking-widest uppercase">
                    <p>&copy; 2026 Plannow Systems.</p>
                    <div className="flex gap-10">
                        {['X (Twitter)', 'LinkedIn', 'GitHub'].map(social => (
                            <a key={social} href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                {social}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;