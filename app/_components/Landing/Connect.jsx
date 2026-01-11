// frontend/src/Components/Landing/Connect.jsx
import React, { useState } from "react";
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Clock,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

const Connect = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔧 Backend hookup later
    console.log("Enquiry:", formData);

    alert("Thanks for reaching out! We'll contact you soon.");

    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <section className="py-24 m-4 rounded-3xl">
      <div className="max-w-6xl p-6 mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-blue-700">
            Get in Touch
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-gray-600">
            Whether you're exploring automated scheduling, onboarding your
            institution, or just curious — we’d love to hear from you.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* ================= LEFT: FORM ================= */}
          <div className="p-8 shadow-2xl bg-white/60 backdrop-blur-xl rounded-3xl">
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              {/* Name */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full py-3 pl-10 pr-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full py-3 pl-10 pr-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Phone (optional)
                </label>
                <div className="relative">
                  <Phone className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full py-3 pl-10 pr-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium">
                  Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what you're looking for..."
                    className="w-full py-3 pl-10 pr-4 border resize-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-4 text-white transition-all duration-300 bg-indigo-600 rounded-2xl hover:bg-indigo-700 hover:scale-[1.01]"
                >
                  Send Enquiry
                </button>
              </div>
            </form>
          </div>

          {/* ================= RIGHT: INFO PANEL ================= */}
          <div className="p-8 text-gray-800 shadow-xl bg-white/40 backdrop-blur-xl rounded-3xl">
            <h3 className="mb-4 text-2xl font-semibold">
              Why Contact Us?
            </h3>

            <p className="mb-6 text-gray-600">
              We help institutions streamline scheduling, reduce conflicts,
              and improve productivity using intelligent automation.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-600" />
                <span>shibin24666@gmail.com</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-600" />
                <span>+91 81368 84184</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Mon – Fri, 9:00 AM – 6:00 PM IST</span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 border-t" />

            {/* Trust / Highlights */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 mt-1 text-green-600" />
                <p className="text-sm text-gray-600">
                  Your data is secure and never shared with third parties.
                </p>
              </div>

              <div className="flex gap-3">
                <HelpCircle className="w-5 h-5 mt-1 text-indigo-600" />
                <p className="text-sm text-gray-600">
                  Not sure what plan fits you? We’ll guide you personally.
                </p>
              </div>
            </div>

            {/* CTA Note */}
            <div className="p-4 mt-8 text-sm text-indigo-700 bg-indigo-100 rounded-xl">
              💡 Most queries are answered within <strong>24 hours</strong>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Connect;
