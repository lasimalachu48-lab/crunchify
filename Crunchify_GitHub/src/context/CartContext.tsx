"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product } from "@/types";
import { playChime } from "@/lib/audio";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  subtotal: number;
  totalCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("crunchify_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load cart from storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("crunchify_cart", JSON.stringify(items));
      } catch (e) {
        console.warn("Failed to save cart to storage", e);
      }
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      return { success: false, message: `"${product.name}" is currently out of stock.` };
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    const currentQty = existingIndex !== -1 ? items[existingIndex].quantity : 0;
    const targetQty = currentQty + quantity;

    if (targetQty > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} units available in stock. Cannot add more.`,
      };
    }

    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity = targetQty;
      setItems(updated);
    } else {
      setItems([...items, { product, quantity }]);
    }

    playChime("pop");
    return { success: true };
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const item = items.find((i) => i.product.id === productId);
    if (!item) return { success: false, message: "Item not in cart" };

    if (quantity > item.product.stock) {
      return {
        success: false,
        message: `Maximum available stock is ${item.product.stock} units.`,
      };
    }

    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

