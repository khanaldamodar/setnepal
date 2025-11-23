"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCartContext } from "@/context/CartContext";

export default function CartPage() {
  //   const { cart, isLoaded, removeFromCart, updateQuantity, clearCart, subtotal, tax, total } = useCart()
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    total,
    isLoaded,
  } = useCartContext();

  const handleClearcart = () => {
    clearCart();
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen font-poppins">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex h-96 items-center justify-center">
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen font-poppins py-30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="mt-2 text-muted-foreground">
            {cart.length} items in your cart
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-card">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                Your cart is empty
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start shopping to add items to your cart
              </p>
              <Link href="/products">
                <Button className="mt-4">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <Link href={`/products/${item.id}`}>
                          <h3 className="font-semibold text-foreground hover:text-primary">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.category}
                        </p>
                        <p className="mt-2 text-lg font-bold text-foreground">
                          Rs. {item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2 rounded-lg border border-border bg-card">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="font-semibold text-foreground">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">
                  Order Summary
                </h2>

                <div className="space-y-3 border-b border-border pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">
                      Rs. {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (13%)</span>
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

                <Link href="/checkout">
                  <Button className="mt-6 w-full bg-secondary" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="mt-3 w-full bg-red-500"
                  onClick={handleClearcart}
                >
                  Clear Cart
                </Button>

                <Link href="/products">
                  <Button variant="ghost" className="mt-3 w-full bg-green-500">
                    Continue Shopping
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
