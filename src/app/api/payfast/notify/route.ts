// app/api/payfast/notify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

const PAYFAST_HOST = process.env.NODE_ENV === "production"
  ? "https://www.payfast.co.za"
  : "https://sandbox.payfast.co.za";

export async function POST(req: Request) {
  const formData = await req.formData();
  const data = Object.fromEntries(formData.entries()) as Record<string, string>;

  console.log("📩 Payfast Notify Data:", data);

  // 1. Verify signature
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const signatureValid = verifySignature(data, passphrase);

  if (!signatureValid) {
    console.error("❌ Invalid Payfast signature");
    return NextResponse.json({ status: "error", message: "Invalid signature" }, { status: 400 });
  }

  // 2. Validate with Payfast server (IPN validation)
  const validationResult = await validateWithPayfast(data);
  if (!validationResult) {
    console.error("❌ Payfast validation failed");
    return NextResponse.json({ status: "error", message: "IPN validation failed" }, { status: 400 });
  }

  // 3. Check status & amount
  if (data.payment_status === "COMPLETE") {
    const amount = parseFloat(data.amount_gross || "0");
    // Compare with your DB expected amount (example hardcoded here)
    const expectedAmount = 2000.0;

    if (Math.abs(amount - expectedAmount) < 0.01) {
      console.log("✅ Payment verified successfully");

      // Example: mark order as paid in DB
      // await db.orders.update({ reference: data.m_payment_id }, { status: "paid" });

      return NextResponse.json({ status: "ok" });
    } else {
      console.error("❌ Amount mismatch");
      return NextResponse.json({ status: "error", message: "Amount mismatch" }, { status: 400 });
    }
  }

  console.warn("⚠️ Payment not complete:", data.payment_status);
  return NextResponse.json({ status: "pending" });
}

/**
 * Verify Payfast signature
 */
function verifySignature(data: Record<string, string>, passphrase: string): boolean {
  // Remove signature from data
  const pfData: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key !== "signature") pfData[key] = value;
  }

  // Sort keys alphabetically
  const sortedKeys = Object.keys(pfData).sort();

  // Build query string
  const queryString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(pfData[key]).replace(/%20/g, "+")}`)
    .join("&");

  const signatureString = passphrase ? `${queryString}&passphrase=${encodeURIComponent(passphrase)}` : queryString;

  // Hash and compare
  const calculatedSignature = crypto.createHash("md5").update(signatureString).digest("hex");
  return calculatedSignature === data.signature;
}

/**
 * Validate with Payfast server (post data back)
 */
async function validateWithPayfast(data: Record<string, string>): Promise<boolean> {
  try {
    const body = new URLSearchParams(data).toString();

    const res = await fetch(`${PAYFAST_HOST}/eng/query/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const text = await res.text();
    return text.trim() === "VALID";
  } catch (err) {
    console.error("Payfast validation error:", err);
    return false;
  }
}
