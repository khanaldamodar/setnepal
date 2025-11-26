"use client";

import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

const CART_COOKIE_NAME = "shopping_cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from cookies on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const cookieValue = document.cookie
          .split("; ")
          .find((row) => row.startsWith(CART_COOKIE_NAME + "="))
          ?.split("=")[1];

        if (cookieValue) {
          const decodedCart = JSON.parse(decodeURIComponent(cookieValue));
          setCart(decodedCart);
        }
      } catch (error) {
        console.error("Error loading cart from cookies:", error);
      }
      setIsLoaded(true);
    };

    loadCart();
  }, []);

  // Save cart to cookies whenever it changes
  const saveCartToCookie = useCallback((items: CartItem[]) => {
    try {
      const cartJson = JSON.stringify(items);
      const encodedCart = encodeURIComponent(cartJson);
      document.cookie = `${CART_COOKIE_NAME}=${encodedCart}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`; // 7 days
    } catch (error) {
      console.error("Error saving cart to cookies:", error);
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(
    (
      product: Omit<CartItem, "quantity"> & { type?: "product" | "package" },
      quantity = 1
    ) => {
      // Assign unique ID namespace
      const uniqueId =
        product.type === "package"
          ? `pkg-${product.id}` // package namespace
          : `prod-${product.id}`; // product namespace

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === uniqueId);

        let updatedCart;
        if (existingItem) {
          updatedCart = prevCart.map((item) =>
            item.id === uniqueId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedCart = [...prevCart, { ...product, id: uniqueId, quantity }];
        }

        saveCartToCookie(updatedCart);
        return updatedCart;
      });
    },
    [saveCartToCookie]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    (productId: number) => {
      setCart((prevCart) => {
        const updatedCart = prevCart.filter((item) => item.id !== productId);
        saveCartToCookie(updatedCart);
        return updatedCart;
      });
    },
    [saveCartToCookie]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      setCart((prevCart) => {
        const updatedCart =
          quantity <= 0
            ? prevCart.filter((item) => item.id !== productId)
            : prevCart.map((item) =>
                item.id === productId ? { ...item, quantity } : item
              );

        saveCartToCookie(updatedCart);
        return updatedCart;
      });
    },
    [saveCartToCookie]
  );

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
    document.cookie = `${CART_COOKIE_NAME}=; path=/; max-age=0`;
  }, []);

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.13; // 13% tax
  const total = subtotal + tax;

  return {
    cart,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    total,
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
  };
}
