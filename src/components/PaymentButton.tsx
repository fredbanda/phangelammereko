"use client";

import { useState } from "react";

export default function PayButton() {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    const res = await fetch("/api/payfast/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 2000, itemName: "LinkedIn Optimization" }),
    });
    const data = await res.json();

    // Create form dynamically and submit
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.payfast.co.za/eng/process";

    Object.entries(data).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      {loading ? "Redirecting..." : "Pay Now"}
    </button>
  );
}
