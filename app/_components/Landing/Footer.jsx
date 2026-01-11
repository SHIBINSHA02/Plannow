// frontend/src/Components/Footer/Footer.jsx
import React from "react";
import { Calendar } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 m-2 mb-0 text-white bg-gray-900 rounded-t-3xl">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4 space-x-2">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Planora</span>
            </div>
            <p className="text-gray-400">
              Empowering educational institutions with intelligent scheduling solutions.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 font-semibold">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#features" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-semibold">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 mt-8 text-center text-gray-400 border-t border-gray-800">
          <p>&copy; 2025 Planora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
