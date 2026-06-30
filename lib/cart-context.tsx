"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ordersOpen as computeOrdersOpen } from "./config";

export type CartItem = {
  name: string;
  variant: string; // "—" means no variant
  weight: string;
  unit: number; // price per pack, or per kg when perKg
  qty: number; // pack count, or total kg when perKg
  key: string; // unique line key for merging
  perKg?: boolean;
};

type CartCtx = {
  cart: CartItem[];
  add: (it: CartItem) => void;
  remove: (index: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  ordersOpen: boolean;
};

const Ctx = createContext<CartCtx | null>(null);

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within <CartProvider>");
  return c;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // default true so SSR and first client render agree; corrected on mount
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(computeOrdersOpen());
  }, []);

  // lock background scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const add = (it: CartItem) => {
    if (!computeOrdersOpen()) {
      alert("Orders for this Diwali are closed.");
      return;
    }
    setCart((prev) => {
      const found = prev.find((x) => x.key === it.key);
      if (found) return prev.map((x) => (x.key === it.key ? { ...x, qty: x.qty + it.qty } : x));
      return [...prev, it];
    });
    setIsOpen(true);
  };

  const remove = (index: number) => setCart((prev) => prev.filter((_, i) => i !== index));
  const clear = () => setCart([]);

  const subtotal = cart.reduce((s, it) => s + it.unit * it.qty, 0);
  // badge = number of distinct products in the cart (raising one product's
  // quantity does not change it; adding a different product does)
  const count = cart.length;

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <Ctx.Provider value={{ cart, add, remove, clear, subtotal, count, isOpen, openCart, closeCart, ordersOpen: open }}>
      {children}
    </Ctx.Provider>
  );
}
