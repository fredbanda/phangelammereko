import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/headers/navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - Phangela Mmereko",
    absolute: "Phangela Mmereko",
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
            <Toaster />
            </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
