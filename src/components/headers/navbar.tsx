"use client";

import Link from "next/link";
import Logo from "../../../public/logo.png";
import Image from "next/image";
import { SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { CreditCard, Menu, X, Shield, DollarSign, Users} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      checkAdminStatus(user.primaryEmailAddress.emailAddress);
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async (email: string) => {
    try {
      const response = await fetch('/api/admin/checkout', {
        headers: {
          'x-user-email': email,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

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
          {/* Show admin links for admin users */}
          {isAdmin && !loading && (
            <>
              <Link 
                href="/admin/sales" 
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              >
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-purple-700 dark:text-purple-300">Sales Dashboard</span>
              </Link>
              <Link 
                href="/admin/leads" 
                className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <Users className="w-4 h-4" />
                Leads
              </Link>
            </>
          )}

          {/* Regular user links */}
          {!isAdmin && user && (
            <>
          
              <Link href="/dashboard">Dashboard</Link>
            </>
          )}

          {/* Common links for all users */}
           <Link href="/resumes">Create Resume</Link>
          <Link href="/job-home">Vacancies</Link>
          <Link href="/jobs/create">Post A Job</Link>
        </div>

        {/* User + Theme */}
        <div className="flex items-center gap-3">
          {/* Admin Badge */}
          {isAdmin && !loading && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-700 rounded-lg">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Admin</span>
            </div>
          )}

          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="outline"
                className="px-3 py-1 rounded text-white dark:text-white bg-gray-700"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Billing"
                labelIcon={<CreditCard className="size-4" />}
                href="/billing"
              />
              {isAdmin && (
                <>
                  <UserButton.Link
                    label="Admin Dashboard"
                    labelIcon={<Shield className="size-4" />}
                    href="/admin/sales"
                  />
                  <UserButton.Link
                    label="View Leads"
                    labelIcon={<Users className="size-4" />}
                    href="/admin/leads"
                  />
                </>
              )}
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
          {/* Admin Badge Mobile */}
          {isAdmin && !loading && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg w-full">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Admin Access</span>
            </div>
          )}

          {/* Admin Links Mobile */}
          {isAdmin && !loading && (
            <>
              <Link 
                href="/admin/sales" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 font-medium"
              >
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Sales Dashboard
              </Link>
              <Link 
                href="/admin/leads" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                Leads Management
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 w-full my-2"></div>
            </>
          )}

          {/* Regular Links Mobile */}
          {!isAdmin && user && (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            </>
          )}

          <Link href="/job-home" onClick={() => setMenuOpen(false)}>
            Current Vacancies
          </Link>
          <Link href="/jobs/create" onClick={() => setMenuOpen(false)}>
            Post A Job
          </Link>
                        <Link href="/resumes" onClick={() => setMenuOpen(false)}>
                Create Resume
              </Link>
        </div>
      )}
    </header>
  );
}