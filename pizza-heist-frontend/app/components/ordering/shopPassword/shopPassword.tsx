"use client";

import { FormEvent, useState } from "react";

export default function ShopPassword({
  teamSlug,
  teamName,
}: {
  teamSlug: string;
  teamName: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/shop-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamSlug,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Incorrect password.");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Shop authentication failed:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <div>
        <h1>{teamName}</h1>

        <p>
          This shop is password protected. Enter the password provided by
          your team to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="shop-password">Shop Password</label>

          <input
            id="shop-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Checking..." : "Enter Shop"}
          </button>
        </form>
      </div>
    </main>
  );
}