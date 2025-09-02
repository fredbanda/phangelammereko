"use client"

import Link from "next/link";
import Logo from "../../../public/logo.png";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { CreditCard } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import {dark} from "@clerk/themes"
import { useTheme } from "next-themes";

export default function Navbar() {
    const {theme} = useTheme()
  return (
    <header className="shadow-sm">
      <div className="max-w-7xl mx-auto p-3 flex items-center justify-between gap-3">
        <Link href="/resumes" className="flex items-center gap-2">
          <Image src={Logo} alt="Logo" width={30} height={30} />
          <span className="text-xl font-bold hidden md:block">Phangela Mmereko</span>
        </Link>
        <UserButton
        appearance={{
            baseTheme: theme === "dark" ? dark : undefined, // ✅ correct use
            elements: {
              avatarBox: {
                width: 30,
                height: 30,
                borderRadius: 15,
                boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.05)",
              },
            },
          }}
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
        <ThemeToggle 
        
        />
      </div>
    </header>
  );
}
