"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EsewaSuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fix broken URL with multiple question marks
    let url = window.location.href;
    const parts = url.split("?");
    if (parts.length > 2) {
      url = parts[0] + "?" + parts.slice(1).join("&");
    }

    const params = new URL(url).searchParams;
    const orderId = params.get("orderId");
    const data = params.get("data");

    // Get optional user info from URL
    const userName = params.get("esewaName") || "Unknown";
    const userAccount = params.get("esewaNumber") || "Unknown";

    if (!orderId || !data) {
      setError("Missing payment parameters");
      setLoading(false);
      return;
    }

    // Decode base64 eSewa payload
    let payloadDecoded: any;
    try {
      payloadDecoded = JSON.parse(atob(data));
      if (typeof payloadDecoded !== "object") throw new Error();
    } catch {
      setError("Failed to decode payment data");
      setLoading(false);
      return;
    }

    const paymentPayload = {
      orderId: Number(orderId),
      userId: 1, // backend expects this
      amount: Number(payloadDecoded.total_amount),
      method: "ESEWA",
      status: "SUCCESS",
      transactionId: payloadDecoded.transaction_uuid || "TXN-UNKNOWN",
      paymentData: {
        ...payloadDecoded,
        userName,
        userAccount,
      },
    };

    const postPayment = async () => {
      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Payment save failed");
        }

        // console.log("Payment posted successfully ✔");
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    postPayment();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Saving payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      {error ? (
        <p className="text-red-500 text-lg">{error}</p>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-green-600">
            Payment Successful 🎉
          </h1>
          <p className="mt-3 text-lg">
            Your payment has been recorded successfully.
          </p>
        </>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-5 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Go Home
      </button>
    </div>
  );
}
