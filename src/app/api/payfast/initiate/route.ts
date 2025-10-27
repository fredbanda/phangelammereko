/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/payfast/initiate/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

// app/api/payfast/initiate/route.ts
const amount =
  process.env.PAYFAST_PRICE_LINKEDIN_OPTIMIZATION ??
  "2000.00"; // fallback if not found

const paymentData = {
  amount,
  item_name: "LinkedIn Optimization",
  // ...other fields
};


export async function POST(req: Request) {
  const { amount, itemName } = await req.json();

  // Normally from env vars
  const merchantId = process.env.PAYFAST_MERCHANT_ID!;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY!;
  const passphrase = process.env.PAYFAST_PASSPHRASE || ""; // optional

  const paymentData: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: "https://careerforty.com/linkedin-optimizer/checkout/success",
    cancel_url: "https://careerforty.com/linkedin-optimizer/checkout/cancel",
    notify_url: "https://careerforty.com/api/payfast/notify",
    amount: amount.toFixed(2),
    item_name: itemName,
  };

  // Build query string
  const queryString = Object.entries(paymentData)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  // Add passphrase if used
  const signatureString = passphrase ? `${queryString}&passphrase=${passphrase}` : queryString;

  // Create signature
  const signature = crypto.createHash("md5").update(signatureString).digest("hex");

  return NextResponse.json({ ...paymentData, signature });
}
