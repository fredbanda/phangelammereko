import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/headers/navbar";
import { Toaster } from "sonner";
import Footer from "@/components/headers/Footer";
import PremiumModal from "@/components/premium/PremiumModal";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "CareerForty | %s",
    absolute:
      "CareerForty | Resume Builder & LinkedIn Optimization for Job Seekers",
  },
  description:
    "Create a professional resume, optimize your LinkedIn profile, and boost your job search confidence with CareerForty — designed for mid-career professionals and every job seeker aiming higher.",
  keywords: "resume, cv, job, phangela, phangela mmereko, free cv",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
            <PremiumModal />
            <Toaster richColors />
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
