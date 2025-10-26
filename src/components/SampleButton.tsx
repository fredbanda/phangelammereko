"use client";
import { useState } from "react";

export default function PayButton() {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    console.log("Pay button clicked");
    
    setLoading(true);
    const res = await fetch("/api/payfast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100.0, item_name: "LinkedIn Optimization" }),
    });
    console.log("Pay response:", res);
    

    const html = await res.text();

    // Replace document with PayFast payment form response
    document.open();
    document.write(html);
    document.close();
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading ? "Processing..." : "Pay with PayFast"}
    </button>
  );
}
