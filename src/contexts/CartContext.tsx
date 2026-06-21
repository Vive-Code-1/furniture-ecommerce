import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LS_KEY = "modulive_cart_v1";

const readLocal = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (items: CartItem[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => readLocal());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const lastSyncedUserId = useRef<string | null>(null);

  // Always mirror cart state to localStorage so refreshes keep items.
  useEffect(() => {
    writeLocal(items);
  }, [items]);

  // When the user changes (login / logout), reconcile with the remote cart.
  useEffect(() => {
    if (!user) {
      lastSyncedUserId.current = null;
      return;
    }
    if (lastSyncedUserId.current === user.id) return;
    lastSyncedUserId.current = user.id;

    let cancelled = false;

    (async () => {
      // 1. Fetch remote cart with product details.
      const { data: remote, error } = await supabase
        .from("cart_items")
        .select("product_id, quantity, products:product_id (id, name, price, image_url)")
        .eq("user_id", user.id);

      if (cancelled || error) return;

      const remoteItems: CartItem[] = (remote ?? [])
        .filter((r: any) => r.products)
        .map((r: any) => ({
          id: r.products.id,
          name: r.products.name,
          price: Number(r.products.price),
          image: r.products.image_url ?? "",
          quantity: r.quantity,
        }));

      // 2. Merge: local quantities + remote quantities (local wins on metadata).
      const localItems = readLocal();
      const map = new Map<string, CartItem>();
      for (const it of remoteItems) map.set(it.id, { ...it });
      for (const it of localItems) {
        const existing = map.get(it.id);
        if (existing) {
          map.set(it.id, { ...it, quantity: existing.quantity + it.quantity });
        } else {
          map.set(it.id, { ...it });
        }
      }
      const merged = Array.from(map.values());

      // 3. Push merged state back to DB (upsert) so quantities stay in sync.
      if (merged.length > 0) {
        await supabase.from("cart_items").upsert(
          merged.map((it) => ({
            user_id: user.id,
            product_id: it.id,
            quantity: it.quantity,
          })),
          { onConflict: "user_id,product_id" }
        );
      }

      if (!cancelled) setItems(merged);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const syncUpsert = useCallback(
    (productId: string, quantity: number) => {
      if (!user) return;
      void supabase
        .from("cart_items")
        .upsert(
          { user_id: user.id, product_id: productId, quantity },
          { onConflict: "user_id,product_id" }
        );
    },
    [user]
  );

  const syncDelete = useCallback(
    (productId: string) => {
      if (!user) return;
      void supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    },
    [user]
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        const next = existing
          ? prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
          : [...prev, { ...item, quantity: 1 }];
        const newQty = next.find((i) => i.id === item.id)!.quantity;
        syncUpsert(item.id, newQty);
        return next;
      });
      setIsCartOpen(true);
    },
    [syncUpsert]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      syncDelete(id);
    },
    [syncDelete]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        syncDelete(id);
        return;
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
      syncUpsert(id, quantity);
    },
    [syncUpsert, syncDelete]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (user) {
      void supabase.from("cart_items").delete().eq("user_id", user.id);
    }
  }, [user]);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen, setIsCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
