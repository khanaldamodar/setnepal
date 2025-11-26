//old version
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import CryptoJS from "crypto-js";

export default function PaymentPage({ packages }: { packages?: any[] }) {
  const router = useRouter();
  const { cart, isLoaded, subtotal, tax, total, clearCart } = useCart();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
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
      price: item.price, // frontend price
      name: item.name,
    })),
    ...(packages?.map((pkg) => ({
      productId: pkg.id, // package ID (unique)
      quantity: 1,
      price: pkg.price, // frontend price for package
      name: pkg.name,
      products: pkg.products?.map((p: any) => ({ id: p.id, name: p.name })),
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

  const generateEsewaSignature = ({
    total_amount,
    transaction_uuid,
    product_code,
  }: any) => {
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const secret = process.env.NEXT_PUBLIC_ESEWA_SECRET_KEY;
    const hash = CryptoJS.HmacSHA256(message, secret);
    return CryptoJS.enc.Base64.stringify(hash);
  };

  const handlePlaceOrder = async () => {
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
          price: item.price, // frontend price
        })),
        shippingAddress,
        paymentMethod,
      };

      const token = localStorage.getItem("token");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to place order");
      }

      const order = await res.json();

      clearCart();
      sessionStorage.removeItem("checkoutData");

      // Handle eSewa Payment
      if (paymentMethod === "ESEWA") {
        const transaction_uuid = "TXN-" + Date.now();
        const formData: any = {
          amount: calculatedTotal.toString(),
          tax_amount: "0",
          total_amount: calculatedTotal.toString(),
          transaction_uuid,
          product_code: "EPAYTEST",
          product_service_charge: "0",
          product_delivery_charge: "0",
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: generateEsewaSignature({
            total_amount: calculatedTotal.toString(),
            transaction_uuid,
            product_code: "EPAYTEST",
          }),
          success_url: `http://localhost:3007/esewa/success?orderId=${
            order.id
          }&esewaName=${encodeURIComponent(
            checkoutData.billingAddress.fullName
          )}&esewaNumber=${encodeURIComponent(
            checkoutData.billingAddress.phoneNumber
          )}`,
          failure_url: `http://localhost:3007/esewa/failure?orderId=${order.id}`,
        };

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        Object.keys(formData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = formData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      router.push(`/order-confirmation/${order.id}`);
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
