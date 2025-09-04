import HeroSection from "@/components/home/hero";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to use this app",
  description: "Home page of the app",
  keywords: ""
};

export default function Home() {
  return (
    <div className="flex  flex-col items-center justify-center">
      <HeroSection />
    </div>
  );
}
