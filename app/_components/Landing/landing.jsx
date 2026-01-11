// frontend/src/Components/Landing/landing.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import Navigation from "../Navigation/Navigation";
import Footer from "../Footer/Footer";
import Connect from "./Connect";

function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-indigo-600" />,
      title: "Smart Scheduling",
      description:
        "AI-powered schedule optimization that considers teacher preferences, room availability, and student needs.",
    },
    {
      icon: <Clock className="w-8 h-8 text-indigo-600" />,
      title: "Time Management",
      description:
        "Effortlessly manage class timings, break schedules, and substitutes.",
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Team Collaboration",
      description:
        "Seamless coordination between teachers and administrators.",
    },
    {
      icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
      title: "Resource Planning",
      description:
        "Optimize classroom and resource allocation with zero conflicts.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAVIGATION */}
      <Navigation />

      <main>
        {/* HERO */}
        <section className="flex items-center justify-center py-20 m-4 rounded-3xl bg-gradient-to-t from-blue-200 via-white to-blue-200 lg:h-[70vh] font-sans ">
          <div className="grid gap-12 px-4 max-w-7xl lg:grid-cols-2 ">
            {/* LEFT */}
            <div className="">
              <h1 className="text-4xl font-semibold md:text-6xl">
                Revolutionize Your
                <span className="text-indigo-600"> School Scheduling</span>
              </h1>

              <p className="mt-6 text-xl text-gray-600">
                Streamline teacher schedules and optimize resources with
                intelligent automation.
              </p>

              <div className="flex flex-col gap-4 mt-8 sm:flex-row">
                {isSignedIn ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center justify-center px-8 py-4 text-white bg-indigo-600 rounded-3xl hover:bg-indigo-700"
                    >
                      Visit Profile
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>

                    <Link
                      to="/organisation"
                      className="flex items-center justify-center px-8 py-4 text-indigo-600 border-2 border-indigo-600 rounded-3xl hover:bg-indigo-50"
                    >
                      Manage Organization
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/signup"
                    className="flex items-center justify-center px-8 py-4 text-white bg-indigo-600 rounded-3xl hover:bg-indigo-700"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                )}
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="relative">
              <div className="p-6 bg-white shadow-2xl rounded-3xl rotate-3">
                <div className="p-4 mb-4 bg-indigo-600 rounded-xl">
                  <Calendar className="w-8 h-8 mx-auto text-white" />
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <span className="block text-sm font-medium">
                      Math – Room 204
                    </span>
                    <span className="text-xs text-gray-500">
                      9:00 AM – 10:30 AM
                    </span>
                  </div>

                  <div className="p-3 bg-gray-100 rounded-xl">
                    <span className="block text-sm font-medium">
                      Science – Lab 1
                    </span>
                    <span className="text-xs text-gray-500">
                      11:00 AM – 12:30 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
            id="features"
            className="py-16 mx-3 rounded-3xl"
          >
            <div className="px-4 mx-auto max-w-7xl"> 
              <div className="flex lg:flex-row flex-col justify-center items-center gap-10">
                <div className="flex justify-center items-center lg:w-1/2 w-full bg-[#4F46E5] p-10 m-4 rounded-3xl">
               


                <img
                  src="/office.png"
                  alt="Office illustration"
                  className="w-full max-w-md lg:max-w-lg object-contain rounded-3xl"
                />
              </div>
              <div className="grid gap-6 grid-cols-1 ">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-5 p-6 text-center transition-shadow bg-white border border-blue-600 shadow-lg rounded-3xl sm:flex-row sm:text-left hover:shadow-xl"
                  >
                    {/* ===== Avatar / Icon ===== */}
                    <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 overflow-hidden bg-indigo-100 rounded-full">
                      {feature.avatar ? (
                        <img
                          src={feature.avatar}
                          alt={feature.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        feature.icon
                      )}
                    </div>

                    {/* ===== Text ===== */}
                    <div className="flex flex-col">
                      <h3 className="mb-1 text-lg font-semibold sm:text-xl">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 sm:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              

              </div>
            </div>
          </section>

        <Connect/>
        <Footer/>
      </main>
    </div>
  );
}

export default LandingPage;
