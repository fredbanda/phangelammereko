"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation"

export default function SignInPage() {
    const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirectUrl") || "/"
  return (
    <main className="flex flex-col items-center justify-center h-screen">
     <SignIn redirectUrl={redirectUrl} />
    </main>
  );
}
