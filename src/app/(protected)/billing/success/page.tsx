export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <main className="soace-y-6 mx-auto h-screen px-3 py-6 text-center">
      <h1 className="tex-3xl font-bold">Thank you for your payment!</h1>
      <p className="text-lg">
        Your payment has been successfully processed. You can now create your
        CVs and resumes.
      </p>
      <p className="text-lg">
        If you have any questions or concerns, please contact us at{" "}
        <a href="mailto:support@eunny.co.za">support@eunny.co.za</a>
      </p>
      <Button asChild className="mx-auto flex w-fit gap-2">
        <Link href="/resumes">
          <PlusSquare className="size-5" />
          Create Resume
        </Link>
      </Button>
    </main>
  );
}
