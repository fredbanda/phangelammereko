"use client";

import React from "react";
import Link from "next/link";

export default function ComingSoon() {
  return (
    <div
      className="relative h-screen w-full flex items-center justify-center bg-cover bg-center text-center px-5"
      style={{
        backgroundImage:
          "url(https://images.pexels.com/photos/260689/pexels-photo-260689.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1200)",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900 opacity-75"></div>

      {/* Content */}
      <div className="z-50 flex flex-col justify-center text-white w-full h-screen">
        <h1 className="text-5xl font-bold">
          We are <span className="text-indigo-400">Almost</span> there!
        </h1>
        <p className="mt-3 text-lg">Stay tuned for something amazing!!!</p>

        {/* Progress Bar */}
        <div className="mt-10 mb-5">
          <div className="shadow w-full bg-white mt-2 max-w-2xl mx-auto rounded-full">
            <div
              className="rounded-full bg-indigo-600 text-xs leading-none text-center text-white py-1 transition-all duration-500"
              style={{ width: "75%" }}
            >
              75%
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="mt-6 flex justify-center gap-4 text-white">
          <Link href="#">
            <svg
              fill="currentColor"
              className="cursor-pointer h-6 hover:text-indigo-400 transition"
              viewBox="0 0 24 24"
            >
              <path d="M24,12c0,6.627-5.373,12-12,12S0,18.627,0,12S5.373,0,12,0s12,5.373,12,12Zm-6.465-3.192c-.379.168-.786.281-1.213.333.436-.262.771-.676.929-1.169-.408.242-.86.418-1.341.513-.385-.411-.934-.667-1.541-.667-1.167,0-2.112.945-2.112,2.111 0,.166.018.327.054.482-1.754-.088-3.31-.929-4.352-2.206-.181.311-.286.674-.286,1.061 0,.733.373,1.379.94,1.757-.346-.01-.672-.106-.956-.264 0,.009 0,.018 0,.027 0,1.023.728,1.877 1.694,2.07-.177.049-.364.075-.556.075-.137,0-.269-.014-.397-.038.268.838 1.048,1.449 1.972,1.466-.723.566-1.633.904-2.622.904-.171,0-.339-.01-.504-.03.934.599 2.044.949 3.237.949 3.883,0 6.007-3.217 6.007-6.008 0-.091-.002-.183-.006-.273.413-.298.771-.67 1.054-1.093Z"></path>
            </svg>
          </Link>

          <Link href="#">
            <svg
              fill="currentColor"
              className="cursor-pointer h-6 hover:text-indigo-400 transition"
              viewBox="0 0 24 24"
            >
              <path d="M24,12c0,6.627-5.373,12-12,12S0,18.627,0,12S5.373,0,12,0s12,5.373,12,12Zm-11.278,0h1.294l.172-1.617h-1.466l.002-.808c0-.422.04-.648.646-.648h.809V7.311h-1.295c-1.555,0-2.103.784-2.103,2.102v.97H9.812v1.617h.969V16.689h1.941V12Z"></path>
            </svg>
          </Link>

          <Link href="#">
            <svg
              fill="currentColor"
              className="cursor-pointer h-6 hover:text-indigo-400 transition"
              viewBox="0 0 24 24"
            >
              <path d="M12,0c6.6,0,12,5.4,12,12s-5.4,12-12,12S0,18.6,0,12,5.4,0,12,0Zm0,21.6c5.3,0,9.6-4.3,9.6-9.6S17.3,2.4,12,2.4,2.4,6.7,2.4,12,6.7,21.6,12,21.6Z"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
