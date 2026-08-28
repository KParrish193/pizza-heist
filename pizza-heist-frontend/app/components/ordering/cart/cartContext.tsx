"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface CartItem {
  id: string;
  teamId: string;
  teamName: string;
  teamSlug: string;
  price: number;
  size: string;
  cut: string;
  length: string;
  neckStyle: string;
  backStyle: string;
  color: string;
  jerseyName: string;
  jerseyNumber: string;
  pronouns: string;
  quantity: number;
}

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "pizza-heist-cart";

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved cart when the page loads
useEffect(() => {
  const savedCart = sessionStorage.getItem(CART_STORAGE_KEY);

  if (savedCart) {
    try {
      setItems(JSON.parse(savedCart));
    } catch (error) {
      console.error("Unable to load cart:", error);
      sessionStorage.removeItem(CART_STORAGE_KEY);
    }
  }

  setIsHydrated(true);
}, []);

useEffect(() => {
  if (!isHydrated) return;

  sessionStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(items)
  );
}, [items, isHydrated]);

  const addItem = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === newItem.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                quantity: Math.min(
                  10,
                  item.quantity + newItem.quantity
                ),
              }
            : item
        );
      }

      return [...currentItems, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(10, Math.max(1, quantity)),
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
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