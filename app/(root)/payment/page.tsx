"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
// import CryptoJS from "crypto-js"; // commented out, not used now

export default function PaymentPage({ packages }: { packages?: any[] }) {
  const router = useRouter();
  const { cart, isLoaded, subtotal, tax, total, clearCart } = useCart();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [transactionId, setTransactionId] = useState(""); // state for eSewa
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load checkout data
  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");
    if (data) setCheckoutData(JSON.parse(data));
    else router.push("/checkout");
  }, [router]);

  // Combine products and packages for orderItems
  const orderItems = [
    ...cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
    })),

    ...(packages?.map((pkg) => ({
      productId: pkg.id, 
      quantity: 1,
      price: pkg.price, 
      name: pkg.name,
      products: pkg.products?.map((p: any) => ({
        id: p.id,
        name: p.name,
      })),
    })) ?? []),
  ];

  const calculatedTotal = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (!isLoaded || !checkoutData) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0 && (!packages || packages.length === 0)) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-card">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                Your cart is empty
              </p>
              <Link href="/products">
                <Button className="mt-4">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handlePlaceOrder = async () => {
    // Prevent order if ESEWA is selected and transactionId is empty
    if (paymentMethod === "ESEWA" && !transactionId.trim()) {
      setError("Transaction ID is required for eSewa payment");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const shippingAddress = `${checkoutData.billingAddress.fullName}, ${
        checkoutData.billingAddress.province
      }, ${checkoutData.billingAddress.district}, ${
        checkoutData.billingAddress.municipality
      }, Ward ${checkoutData.billingAddress.ward}${
        checkoutData.billingAddress.zipCode
          ? `, ${checkoutData.billingAddress.zipCode}`
          : ""
      }`;

      const payload = {
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        ...(paymentMethod === "ESEWA" && { transactionId }),
      };

      const token = localStorage.getItem("token");

      // Create Order
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const orderId = data?.id || data?.data?.id;

      if (!res.ok || !orderId) {
        throw new Error(data?.message);
      }

      //  If ESEWA, post payment record
      if (paymentMethod === "ESEWA") {
        const paymentPayload = {
          orderId: Number(orderId),
          userId: 1, // replace with actual user ID if available
          amount: calculatedTotal, // or total from payload
          method: "ESEWA",
          status: "SUCCESS",
          transactionId: transactionId,
          paymentData: {
            transactionId,
            totalAmount: calculatedTotal,
            userName: checkoutData.billingAddress.fullName,
            userAccount: checkoutData.billingAddress.phoneNumber,
          },
        };

        const paymentRes = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        });

        if (!paymentRes.ok) {
          const errData = await paymentRes.json();
          throw new Error(errData.message || "Payment save failed");
        }
      }

      // Clear cart & redirect
      clearCart();
      sessionStorage.removeItem("checkoutData");
      router.push(`/order-confirmation/${orderId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen font-poppins py-15">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Payment</h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Cart</span>
            <ChevronRight className="h-4 w-4" />
            <span>Shipping</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Payment</span>
            <ChevronRight className="h-4 w-4" />
            <span>Confirmation</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Payment + Billing */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Payment Method
              </h2>
              <div className="space-y-3">
                {["COD", "Bank", "ESEWA"].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-card/50"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4"
                    />
                    <p className="font-medium text-foreground">{method}</p>
                  </label>
                ))}

                {paymentMethod === "ESEWA" && (
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full rounded border border-border p-2"
                        placeholder="Enter eSewa Transaction ID"
                        required
                      />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="mb-1 text-xs font-medium text-gray-500">
                        Scan for Pay
                      </span>

                      <div className="w-50 h-50 border border-dashed border-gray-400 rounded flex items-center justify-center text-gray-500">
                        {/* QR code will be assigned here */}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Billing Address
              </h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{checkoutData.billingAddress.fullName}</p>
                <p>{checkoutData.billingAddress.province}</p>
                <p>
                  {checkoutData.billingAddress.district},{" "}
                  {checkoutData.billingAddress.municipality}{" "}
                  {checkoutData.billingAddress.zipCode || ""}
                </p>
                <p>Ward {checkoutData.billingAddress.ward}</p>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Order Summary
              </h2>

              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto border-b border-border pb-4">
                {orderItems.map((item: any) => (
                  <div
                    key={item.productId}
                    className="flex flex-col text-sm border-b border-border pb-2"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-foreground">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    {item.products && (
                      <p className="text-xs text-muted-foreground">
                        Includes:{" "}
                        {item.products.map((p: any) => p.name).join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    Rs. {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium text-foreground">
                    Rs. {tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">Free</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                  Rs. {total.toFixed(2)}
                </span>
              </div>

              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

              <Button
                className="mt-6 w-full bg-secondary"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>

              <Link href="/checkout">
                <Button
                  variant="outline"
                  className="mt-3 w-full bg-transparent"
                >
                  Back to Checkout
                </Button>
              </Link>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Your payment information is secure and encrypted
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
