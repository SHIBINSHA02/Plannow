// frontend/src/Components/Landing/Connect.jsx
import React, { useState } from "react";
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Send,
  Clock, // Re-added Clock
} from "lucide-react";

export default function Connect() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔧 Backend hookup later
    console.log("Connect Form Submitted:", formData);
    alert("Message simulation success!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section className="relative py-32  bg-blue-100  lg:rounded-t-[5rem] rounded-2xl border-t-2 border-blue-200">
      <div
        className="absolute inset-0 opacity-80 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 350 350' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      {/* Abstract Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-[20%] w-[400px] h-[400px] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[80px] opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px]  rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute inset-0  backdrop-blur-[50px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 origin-bottom">
          <div className="inline-flex items-center justify-center p-2 mb-6 rounded-2xl bg-blue-50/50 border border-blue-100/50 backdrop-blur-sm">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 tracking-tight leading-tight">
            Initiate a <span className="italic text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-400">dialogue</span>.
          </h2>
          <p className="mt-6 text-lg text-gray-400 font-extralight max-w-2xl mx-auto leading-relaxed">
            Interested in deploying Planora at your institution? Let&apos;s architect a schedule optimization strategy tailored for you.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-5 items-stretch animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          {/* ================= LEFT: FORM ================= */}
          <div className="lg:col-span-3 p-10 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-gray-100/50 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            {/* Soft inner glow */}
            <div className="absolute inset-0 bg-linear-to-br from-white/40 to-transparent pointer-events-none" />

            <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
              <div className="grid gap-10 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-3">
                  <label className="text-xs font-light tracking-[0.15em] text-gray-500 uppercase ml-1">
                    Your Identity
                  </label>
                  <div className="relative group/input shadow-sm rounded-xl">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within/input:text-blue-400 transition-colors duration-500" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full pl-12 pr-4 py-4 bg-[#fcfcfc] border-b border-gray-200 outline-none text-gray-800 font-light placeholder-gray-400 focus:border-blue-400 focus:bg-white transition-all duration-500  shadow-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <label className="text-xs font-light tracking-[0.15em] text-gray-500 uppercase ml-1">
                    Electronic Mail
                  </label>
                  <div className="relative group/input shadow-sm rounded-xl">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-blue-400 transition-colors duration-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@institution.edu"
                      className="w-full pl-12 pr-4 py-4 bg-[#fcfcfc] border-b border-gray-200 outline-none text-gray-800 font-light placeholder-gray-400 focus:border-blue-400 focus:bg-white transition-all duration-500 shadow-sm rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-3">
                <label className="text-xs font-light tracking-[0.15em] text-gray-500 uppercase ml-1">
                  Inquiry Details
                </label>
                <div className="relative group/input">
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your current scheduling challenges..."
                    className="w-full p-6 bg-[#fcfcfc] border border-gray-100 outline-none text-gray-800 font-light placeholder-gray-400 focus:border-blue-200 focus:bg-white focus:shadow-[0_10px_30px_-15px_rgba(59,130,246,0.1)] transition-all duration-500 shadow-sm rounded-xl resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-gray-900 text-white rounded-full overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <div className="absolute inset-0 bg-linear-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center text-sm tracking-widest uppercase font-light">
                  Transmit Request <Send className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                </span>
              </button>
            </form>
          </div>

          {/* ================= RIGHT: INFO PANEL ================= */}
          <div className="lg:col-span-2 flex flex-col justify-between p-10 bg-linear-to-br from-blue-50 to-indigo-50/30 rounded-[2.5rem] border border-blue-100/50 relative overflow-hidden">
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 space-y-10">
              <div>
                <h3 className="text-2xl font-extralight text-gray-900 tracking-tight mb-4">Direct Channels</h3>
                <p className="text-gray-500 font-extralight leading-relaxed text-sm">
                  Prefer direct communication? Our orchestration specialists are available during operational hours.
                </p>
              </div>

              <div className="space-y-6">
                {/* Contact Items */}
                <div className="flex items-center group cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 border border-white backdrop-blur-sm text-blue-500 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="ml-5">
                    <p className="text-[10px] font-light tracking-[0.2em] uppercase text-gray-400 mb-1">Electronic</p>
                    <a href="mailto:[EMAIL_ADDRESS]" className="text-gray-800 font-light hover:text-blue-600 transition-colors">shibin24666@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-center group cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 border border-white backdrop-blur-sm text-indigo-500 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="ml-5">
                    <p className="text-[10px] font-light tracking-[0.2em] uppercase text-gray-400 mb-1">Voice</p>
                    <a href="tel:+18005550199" className="text-gray-800 font-light hover:text-indigo-600 transition-colors">+91 8136884184</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Highlight/Trust */}
            <div className="relative z-10 mt-12 p-6 bg-white/50 backdrop-blur-md rounded-3xl border border-white">
              <p className="text-sm text-gray-600 font-light italic leading-relaxed">
                "Implementation was seamless. Planora's algorithms resolved scheduling conflicts we had struggled with for a decade."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-light">
                  DR
                </div>
                <div className="text-xs">
                  <p className="font-light text-gray-900">Dr. Robert Chen</p>
                  <p className="font-extralight text-gray-500">Dean of Academics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
