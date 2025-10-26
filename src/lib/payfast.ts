// lib/payfast.ts
import crypto from "crypto";

export interface PayFastConfig {
  merchant_id: string;
  merchant_key: string;
  passPhrase?: string; // optional now
  testMode: boolean;
}

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  cell_number?: string;
  m_payment_id: string; // Your unique payment ID
  amount: string; // Amount in ZAR
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
}

class PayFastService {
  private config: PayFastConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      passPhrase: process.env.PAYFAST_PASSPHRASE || undefined, // optional
      testMode: process.env.NODE_ENV !== "production",
    };

    this.baseUrl = this.config.testMode
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";
  }

  /**
   * Generate PayFast payment signature
   */
  private generateSignature(
    data: Record<string, string>,
    passPhrase?: string
  ): string {
    // Create a clean copy of data, filtering out empty values and signature
    const cleanData: Record<string, string> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      // Skip signature field and empty/undefined values
      if (key !== "signature" && value !== undefined && value !== null && value !== "") {
        cleanData[key] = String(value).trim();
      }
    });

    // Sort alphabetically by key
    const sortedKeys = Object.keys(cleanData).sort();

    // Build query string exactly as PayFast expects
    const queryPairs: string[] = [];
    
    sortedKeys.forEach(key => {
      const value = cleanData[key];
      // PayFast is very specific about encoding - use standard URL encoding
      queryPairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });

    let pfOutput = queryPairs.join("&");

    // Append passphrase if provided (and not empty)
    if (passPhrase && passPhrase.trim().length > 0) {
      pfOutput += `&passphrase=${encodeURIComponent(passPhrase.trim())}`;
    }

    // Debug logs
    console.log("=== PayFast Signature Debug ===");
    console.log("Clean data:", cleanData);
    console.log("Signature string:", pfOutput);
    console.log("Using passphrase:", !!passPhrase);

    // Generate MD5 signature
    const signature = crypto.createHash("md5").update(pfOutput).digest("hex");
    console.log("Generated signature:", signature);
    console.log("===============================");

    return signature;
  }

  /**
   * Create payment data with signature
   */
  createPayment(orderData: {
    orderId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    amount: number; // Amount in cents
    description: string;
  }): {
    paymentData: PayFastPaymentData & { signature: string };
    paymentUrl: string;
  } {
    const [firstName, ...lastNameParts] = orderData.clientName.split(" ");
    const lastName = lastNameParts.join(" ") || firstName;

    // Build payment data - be very careful about data types and empty values
    const paymentData: Record<string, string> = {
      merchant_id: this.config.merchant_id,
      merchant_key: this.config.merchant_key,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/linkedin-optimizer/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/linkedin-optimizer/checkout/cancel`,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payfast/webhook`,
      name_first: firstName,
      name_last: lastName,
      email_address: orderData.clientEmail,
      m_payment_id: orderData.orderId,
      amount: (orderData.amount / 100).toFixed(2), // Convert cents to ZAR with 2 decimals
      item_name: "LinkedIn Optimization Consultation",
      custom_str1: orderData.orderId,
    };

    // Only add optional fields if they have values
    if (orderData.clientPhone && orderData.clientPhone.trim()) {
      paymentData.cell_number = orderData.clientPhone.trim();
    }

    if (orderData.description && orderData.description.trim()) {
      paymentData.item_description = orderData.description.trim();
    }

    // Generate signature
    const signature = this.generateSignature(paymentData, this.config.passPhrase);

    // Return the final payment data with signature
    const finalPaymentData = {
      ...paymentData,
      signature
    } as PayFastPaymentData & { signature: string };

    return {
      paymentData: finalPaymentData,
      paymentUrl: this.baseUrl,
    };
  }

  /**
   * Verify PayFast notification
   */
  verifyPayment(pfData: Record<string, string>): boolean {
    try {
      // Extract signature
      const { signature, ...dataToVerify } = pfData;

      if (!signature) {
        console.error("No signature provided in PayFast data");
        return false;
      }

      // Generate signature for verification
      const generatedSignature = this.generateSignature(dataToVerify, this.config.passPhrase);

      console.log("=== PayFast Verification ===");
      console.log("Received signature:", signature);
      console.log("Generated signature:", generatedSignature);
      console.log("Match:", signature === generatedSignature);
      console.log("===========================");

      return signature === generatedSignature;
    } catch (error) {
      console.error("Error verifying PayFast payment:", error);
      return false;
    }
  }

  /**
   * Validate payment notification data
   */
  async validatePaymentNotification(
    pfData: Record<string, string>
  ): Promise<{
    isValid: boolean;
    orderId?: string;
    paymentStatus?: string;
    amount?: string;
  }> {
    try {
      // Verify signature first
      if (!this.verifyPayment(pfData)) {
        console.error("PayFast signature verification failed");
        return { isValid: false };
      }

      // Additional validation: check required fields
      if (!pfData.m_payment_id && !pfData.custom_str1) {
        console.error("PayFast notification missing payment ID");
        return { isValid: false };
      }

      return {
        isValid: true,
        orderId: pfData.custom_str1 || pfData.m_payment_id,
        paymentStatus: pfData.payment_status,
        amount: pfData.amount_gross,
      };
    } catch (error) {
      console.error("PayFast validation error:", error);
      return { isValid: false };
    }
  }
}

export const payfast = new PayFastService();