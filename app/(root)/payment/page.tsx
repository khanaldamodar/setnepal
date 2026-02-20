"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PaymentPage({ packages }: { packages?: any[] }) {
  const router = useRouter();
  const { cart, isLoaded, subtotal, tax, total, clearCart } = useCart();

  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // BANK PAYMENT STATES
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [transactionId, setTransactionId] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load checkout data
  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");
    if (data) setCheckoutData(JSON.parse(data));
    else router.push("/checkout");
  }, [router]);

  // Fetch banks when BANK method is selected
  useEffect(() => {
    if (paymentMethod === "BANK") {
      fetch("/api/banks")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setBanks(data);
          else if (Array.isArray(data.data)) setBanks(data.data);
          else if (Array.isArray(data.banks)) setBanks(data.banks);
          else {
            console.error("Unexpected banks response:", data);
            setBanks([]);
          }
        })
        .catch((err) => console.error("Error fetching banks:", err));
    }
  }, [paymentMethod]);

  const orderItems = [
    ...cart.map((item) => ({
      productId: item.id,
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      category: item.category || (item.id.toString().startsWith("pkg-") ? "Package" : "Product"),
    products: undefined as any,
    })),
    ...(packages?.map((pkg) => ({
      productId: pkg.id,
      id: pkg.id,
      quantity: 1,
      price: pkg.price,
      name: pkg.name,
      category: "Package",
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

  // Place Order
  const handlePlaceOrder = async () => {
    setError(null);

    // BANK validation
    if (paymentMethod === "BANK") {
      if (!selectedBank) {
        toast.error("Please select a bank");
        return;
      }
      if (!transactionId.trim()) {
        toast.error("Transaction ID is required for bank payment");
        return;
      }
    }

    setIsProcessing(true);

    try {
      const shippingAddress = `${checkoutData.billingAddress.fullName}, ${checkoutData.billingAddress.province
        }, ${checkoutData.billingAddress.district}, ${checkoutData.billingAddress.municipality
        }, Ward ${checkoutData.billingAddress.ward}${checkoutData.billingAddress.zipCode
          ? `, ${checkoutData.billingAddress.zipCode}`
          : ""
        }`;

      const payload = {
        items: orderItems.map((item) => ({
          productId: item.category === "Package" ? undefined : Number((item.productId ?? item.id).toString().replace(/(pkg-|prod-)/, "")),
          packageId: item.category === "Package" ? Number((item.productId ?? item.id).toString().replace(/(pkg-|prod-)/, "")) : undefined,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          products: item.products,
        })),
        shippingAddress,
        paymentMethod: paymentMethod === "BANK" ? "ONLINE" : "COD",
        ...(paymentMethod === "BANK" && {
          bankId: selectedBank.id,
          transactionId,
        }),
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
        throw new Error(data?.message || "Failed to create order");
      }

      // Save Payment
      if (paymentMethod === "BANK") {
        const paymentPayload = {
          orderId: Number(orderId),
          userId: 1,
          amount: calculatedTotal,
          method: "ONLINE",
          status: "SUCCESS",
          bankId: selectedBank.id,
          transactionId,
          paymentData: {
            bankName: selectedBank.name,
            qr: selectedBank.qr,
            transactionId,
          },
        };

        const paymentRes = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        });

        if (!paymentRes.ok) {
          const errData = await paymentRes.json();
          throw new Error(errData.message || "Payment saving failed");
        }
      }

      // SUCCESS
      clearCart();
      sessionStorage.removeItem("checkoutData");

      toast.success("Order placed successfully!");

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      const message =
        err?.message || "Something went wrong while placing your order";
      setError(message);
      toast.error(message);
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
                {["COD", "BANK"].map((method) => (
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
                    <p className="font-medium text-foreground">
                      {method === "BANK"
                        ? "Online Bank Transfer"
                        : "Cash on Delivery"}
                    </p>
                  </label>
                ))}

                {/* BANK PAYMENT FIELDS */}
                {paymentMethod === "BANK" && (
                  <div className="mt-2 space-y-4">
                    {/* Bank dropdown */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Select Bank
                      </label>
                      <select
                        className="w-full rounded border border-border p-2"
                        onChange={(e) => {
                          const bank = banks.find(
                            (b) => b.id == e.target.value
                          );
                          setSelectedBank(bank);
                        }}
                      >
                        <option value="">Choose a bank</option>
                        {banks.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* After bank selected */}
                    {selectedBank && (
                      <>
                        {/* Transaction ID */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Transaction ID
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full rounded border border-border p-2"
                            placeholder="Enter transaction ID"
                            required
                          />
                        </div>

                        {/* QR */}
                        {/* QR & Bank Details */}
                        <div className="mt-4 p-4 border rounded-xl bg-card shadow-sm">
                          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                            {/* Left: QR Code (Larger) */}
                            <div className="flex-shrink-0">
                              <div className="w-64 h-64 border rounded-lg overflow-hidden bg-white p-2 shadow-sm">
                                <img
                                  src={selectedBank.qr}
                                  alt="Scan to Pay"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                                Scan to Pay
                              </p>
                            </div>

                            {/* Right: Bank Details */}
                            <div className="flex-grow space-y-4 pt-2">
                              <h3 className="font-semibold text-lg text-foreground border-b border-border pb-2">
                                Bank Details
                              </h3>

                              <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-1 gap-1">
                                  <span className="text-muted-foreground">Bank Name</span>
                                  <span className="font-medium text-foreground">{selectedBank.name}</span>
                                </div>

                                {selectedBank.businessName && (
                                  <div className="grid grid-cols-1 gap-1">
                                    <span className="text-muted-foreground">Account Name</span>
                                    <span className="font-medium text-foreground">{selectedBank.businessName}</span>
                                  </div>
                                )}

                                {selectedBank.accountNumber && (
                                  <div className="grid grid-cols-1 gap-1">
                                    <span className="text-muted-foreground">Account Number</span>
                                    <span className="font-medium text-foreground text-base tracking-wide">{selectedBank.accountNumber}</span>
                                  </div>
                                )}

                                {selectedBank.branch && (
                                  <div className="grid grid-cols-1 gap-1">
                                    <span className="text-muted-foreground">Branch</span>
                                    <span className="font-medium text-foreground">{selectedBank.branch}</span>
                                  </div>
                                )}
                              </div>

                              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  Please include the <strong>Transaction ID</strong> below after making the payment.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Billing */}
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
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium text-foreground">
                    Rs. {subtotal.toFixed(2)}
                  </span>
                </div>
                {/* <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium text-foreground">
                    Rs. {tax.toFixed(2)}
                  </span>
                </div> */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">Free Inside Valley</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                  Rs. {subtotal.toFixed(2)}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}
