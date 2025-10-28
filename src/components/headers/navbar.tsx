"use client";

import Link from "next/link";
import Logo from "../../../public/logo.png";
import Image from "next/image";
import { SignedOut, SignInButton, UserButton, useUser} from "@clerk/nextjs";
import { CreditCard, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";
import { Button } from "../ui/button";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const {user} = useUser();

  return (
    <header className="shadow-sm">
      <div className="max-w-7xl mx-auto p-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src={Logo} alt="Logo" width={30} height={30} />
          <span className="text-xl font-bold uppercase hidden md:block">CareerForty</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center text-black dark:text-white">
          <Link href="/resumes">Create Resume</Link>
          {user && (
            <Link href="/dashboard">Dashboard</Link>
            
          )}
          <Link href="/job-home">Vacancies</Link>
          <Link href="/jobs/create">Post A Job</Link>
        </div>

        {/* User + Theme */}
 <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="px-3 py-1 rounded text-white  dark:text-white bg-gray-700"
            >
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>

        <UserButton
        // appearance={{
        //     baseTheme: theme === "dark" ? dark : undefined, // ✅ correct use
        //     elements: {
        //       avatarBox: {
        //         width: 30,
        //         height: 30,
        //         borderRadius: 15,
        //         boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.05)",
        //       },
        //     },
        //   }}
        >
          <UserButton.MenuItems>
            <UserButton.Link
              label="Billing"
              labelIcon={
              <CreditCard className="size-4" />
            }
              href="/billing"
            />
          </UserButton.MenuItems>
        </UserButton>
          <ThemeToggle />

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="fixed top-[64px] inset-x-0 bg-white dark:bg-gray-900 shadow-md flex flex-col z-50 items-start p-4 space-y-4 md:hidden dark:text-white">
          <Link href="/editor" onClick={() => setMenuOpen(false)}>Create Resume</Link>
          {user && (
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          )}

          <Link href="/job-home" onClick={() => setMenuOpen(false)}>Current Vacancies</Link>
          <Link href="/jobs/create" onClick={() => setMenuOpen(false)}>Post A Job</Link>
        </div>
      )}
    </header>
  );
}

