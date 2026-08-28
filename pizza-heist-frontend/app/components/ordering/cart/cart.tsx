// display cart state
// checkout button -> Stripe checkout page

"use client";

import { useState } from "react";
import { useCart } from "./cartContext";
import styles from "./cart.module.css";
import Image from "next/image";

type CartProps = {
  onContinueShopping: () => void;
};

export default function Cart({
  onContinueShopping,
}: CartProps) {
  const { items, removeItem, updateQuantity } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  // display cart total
  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  // handle creating checkout session
  const handleCheckout = async () => {
  setCheckingOut(true);

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to start checkout.");
    }

    window.location.href = data.url;
  } catch (error) {
    console.error(error);
    alert("Something went wrong starting checkout. Please try again.");
  } finally {
    setCheckingOut(false);
  }
};   

  return (
    <div className={styles.cart}>
      <div className={styles.cartItems}>
      {items.map((item) => (
        <div className={styles.cartItem} key={item.id}>
            {/* TODO: update this to dynamically pull in team name from URL/team shop */}
          <h3>
            {item.teamName ? `${item.teamName} jersey` : "Custom Jersey"}
          </h3>
          <div className={styles.itemDetails}>
            <p className={styles.disclaimer}>Details</p>
            <p>
              <strong>Price:</strong> ${item.price}
            </p>
            <p>
              <strong>Color:</strong> {item.color}
            </p>
            <p>
              <strong>Size:</strong> {item.size}
            </p>
            <p>
              <strong>Cut:</strong> {item.cut}
            </p>
            <p>
              <strong>Length:</strong> {item.length}
            </p>
            <p>
              <strong>Neck:</strong> {item.neckStyle}
            </p>
            <p>
              <strong>Back:</strong> {item.backStyle}
            </p>
            <p>
              <strong>Number:</strong> {item.jerseyNumber}
            </p>
            <p>
              <strong>Name:</strong> {item.jerseyName || "—"}
            </p>
            <p>
            <strong>Pronouns:</strong> {item.pronouns || "—"}
            </p>
          </div>

          <div className={styles.quantity}>
            <p className={styles.disclaimer}>Quantity</p>
              <div>
                <button
                    type="button"
                    onClick={() =>
                    updateQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                    className={styles.minus}/>
                <span>{item.quantity}</span>
                <button
                    type="button"
                    onClick={() =>
                    updateQuantity(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= 5}
                    aria-label="Increase quantity"
                    className={styles.plus}
                />
              </div>
            </div>

            <div className={styles.priceWrapper}>
                <p className={styles.disclaimer}>Price</p>
                <div className={styles.price}>
                    ${(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                type="button"
                onClick={() => removeItem(item.id)}
                className={styles.removeBtn}
                aria-label={`Remove jersey from cart`}
              >
                <Image
                src={"/icons/trash.svg"}
                alt={"remove from cart"}
                width={16}
                height={16}
                />
              </button>
            </div>
        </div>
      ))}
      </div>

      <div className={styles.cartFooter}>
        <div className={styles.cartTotal}>
          <p className={styles.disclaimer}>Cart Total</p>
          <span>${cartTotal.toFixed(2)}</span>
          {/* TODO: edit this when we implement additional shipping options */}
          <p className={`${styles.disclaimer} ${styles.tax}`}>Shipping Option: Pick up in person — Free</p>
          <p className={`${styles.disclaimer} ${styles.tax}`}>Tax calculated at Checkout</p>

        </div>

        <div>
            <button 
                type="button"
                className={`button-secondary ${styles.keepShoppingButton}`}
                onClick={onContinueShopping}>
                Keep Shopping
            </button>
            <button
                type="button"
                className={`button-primary ${styles.checkoutButton}`}
                onClick={handleCheckout}
                disabled={checkingOut || items.length === 0}
                >
                {checkingOut ? "Loading..." : "Checkout"}
            </button>
        </div>
      </div>
    </div>
  );
}