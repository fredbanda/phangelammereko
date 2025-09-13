import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYFAST_URL =
  process.env.PAYFAST_SANDBOX === "true"
    ? process.env.PAYFAST_SANDBOX_URL!
    : "https://www.payfast.co.za/eng/process";

function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // 1. Sort keys alphabetically
  const sortedKeys = Object.keys(data).sort();

  // 2. Build query string
  let queryString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  // 3. Append passphrase if available
  if (passphrase) {
    queryString += `&passphrase=${encodeURIComponent(passphrase)}`;
  }

  // 4. Hash with MD5
  return crypto.createHash("md5").update(queryString).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { amount, item_name } = await req.json();

    // Build PayFast request data
    const payfastData: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payfast/notify`,
      amount: Number(amount).toFixed(2), // Ensure two decimals
      item_name: item_name || "Test Item",
    };

    // Generate signature
    const signature = generateSignature(payfastData, process.env.PAYFAST_PASSPHRASE);
    payfastData["signature"] = signature;

    // Build form body for POST
    const formBody = new URLSearchParams(payfastData).toString();

    // Forward request to PayFast Sandbox
    const response = await fetch(PAYFAST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    // If PayFast responds with redirect
    if (response.ok) {
      const text = await response.text();
      return new NextResponse(text, { status: 200 });
    }

    return new NextResponse("Error posting to PayFast", { status: response.status });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("PayFast error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
