"use client";

import { useEffect } from "react";

const CART_STORAGE_KEY = "pizza-heist-cart";

export default function ClearCart() {
  useEffect(() => {
    sessionStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  return null;
}