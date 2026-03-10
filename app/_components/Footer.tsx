"use client";

import React from "react";
import { Calendar, Heart } from "lucide-react";

const Footer: React.FC = () => {
    return (
        <footer className="pt-32 pb-16 mt-32 relative overflow-hidden bg-white border-t border-gray-100">
            {/* Ethereal Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-blue-200 to-transparent opacity-50" />
            <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="px-6 mx-auto max-w-7xl relative z-10">
                <div className="grid grid-cols-1 gap-16 md:grid-cols-4 lg:grid-cols-5">

                    {/* Brand */}
                    <div className="md:col-span-2 lg:col-span-2 space-y-8 pr-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-2xl font-extralight tracking-tight text-gray-800">Planora</span>
                        </div>
                        <p className="text-gray-400 font-extralight leading-relaxed hover:text-gray-500 transition-colors duration-500">
                            Designing the future of institutional orchestration. Seamless, intelligent, and beautifully human.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-extralight tracking-wide">
                            <span>Crafted with</span>
                            <Heart className="w-3.5 h-3.5 text-blue-300 fill-blue-100 animate-pulse" />
                            <span>at Marian Engineering College</span>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-8">
                        <h3 className="text-xs font-light text-gray-900 uppercase tracking-[0.2em]">Product</h3>
                        <ul className="space-y-5">
                            {['Ecosystem', 'Intelligence', 'Integration', 'Updates'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 font-extralight hover:text-blue-500 transition-colors duration-300">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-8">
                        <h3 className="text-xs font-light text-gray-900 uppercase tracking-[0.2em]">Support</h3>
                        <ul className="space-y-5">
                            {['Documentation', 'Connect', 'Resources', 'Network Status'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 font-extralight hover:text-blue-500 transition-colors duration-300">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-8">
                        <h3 className="text-xs font-light text-gray-900 uppercase tracking-[0.2em]">Legal</h3>
                        <ul className="space-y-5">
                            {['Privacy Directive', 'Terms of Service', 'Cookie Declaration'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 font-extralight hover:text-blue-500 transition-colors duration-300">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Bottom */}
                <div className="pt-16 mt-16 border-t border-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-gray-400 font-extralight tracking-widest uppercase">
                    <p>&copy; 2025 Planora Systems.</p>
                    <div className="flex gap-10">
                        <a href="#" className="hover:text-blue-500 transition-colors">X (Twitter)</a>
                        <a href="#" className="hover:text-blue-500 transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-blue-500 transition-colors">GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
