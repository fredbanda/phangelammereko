"use client";

import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { useState } from "react";
import { toast } from "sonner";
import { createCheckoutSession } from "./actions";
import { useSession } from "next-auth/react"; // ✅ import useSession
import { useRouter } from "next/navigation"; // ✅ use router for redirect

const donateFeatures = [
  "Up to 8 CVs/Resumes",
  "Premium templates",
  "AI assistance",
];
const premiumSubscriptionFeatures = [
  "AI Assistance",
  "Unlimited CVs or Resumes",
  "Customizable Resume Templates",
  "Access to Premium Features",
];

export default function PremiumModal() {
  const { open, setOpen } = usePremiumModal();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession(); // ✅ hook called at top level
  const router = useRouter();

  async function handlePremiumClick(priceId: string) {
    try {
      // 🧠 1️⃣ Check if user is logged in first
      if (!session?.user) {
        toast.error("Please sign in to continue", { position: "top-right" });
        router.push("/sign-in"); // ✅ use Next.js router navigation
        return;
      }

      // 🧠 2️⃣ Proceed with checkout
      setLoading(true);
      const sessionResult = await createCheckoutSession(priceId);

      if (sessionResult.url) {
        window.location.href = sessionResult.url;
      } else if (sessionResult.requiresAuth) {
        toast.error("Please log in to continue", { position: "top-right" });
      } else {
        toast.error(
          sessionResult.error ||
            "Something went wrong while creating the checkout session",
          { position: "top-right" },
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while creating the checkout session", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!loading) {
          setOpen(open);
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Maximum Number Reached</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p>
            You have reached the maximum number of free CVs / resumes. Donate to
            continue creating resumes.
          </p>

          <div className="flex">
            {/* Donate Section */}
            <div className="flex w-1/2 flex-col space-y-5">
              <h3 className="text-center text-lg font-bold">Donate</h3>
              <ul className="list-inside list-disc space-y-2">
                {donateFeatures.map((donFeat) => (
                  <li key={donFeat} className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    {donFeat}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  handlePremiumClick(
                    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_DONATE!,
                  )
                }
                disabled={loading}
              >
                Donate
              </Button>
            </div>

            <div className="mx-6 border-l" />

            {/* Premium Section */}
            <div className="flex w-1/2 flex-col space-y-5">
              <h3 className="text-center text-lg font-bold text-emerald-500">
                Premium Subscription
              </h3>
              <ul className="list-inside list-disc space-y-2">
                {premiumSubscriptionFeatures.map((premFeat) => (
                  <li key={premFeat} className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    {premFeat}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  handlePremiumClick(
                    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!,
                  )
                }
                disabled={loading}
                variant="destructive"
              >
                Get Premium Subscription
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
