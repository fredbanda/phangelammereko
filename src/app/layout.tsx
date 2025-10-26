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
    template: "%s - CareerForty - No time for a good career",
    absolute: "CareerForty",
  },
  description:
    "Looking for a job is hard but creating your CVs shouldn&pos;t be",
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
