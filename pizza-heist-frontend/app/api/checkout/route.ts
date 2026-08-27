import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Custom ${item.teamName} Jersey - ${item.color || ""}`,
          description: [
            `Color: ${item.color}`,
            `Size: ${item.size}`,
            `Cut: ${item.cut}`,
            `Length: ${item.length}`,
            `Neck: ${item.neckStyle}`,
            `Back: ${item.backStyle}`,
            `Number: ${item.jerseyNumber}`,
            `Name: ${item.jerseyName}`,
            item.pronouns ? `Pronouns: ${item.pronouns}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${items[0].teamSlug}/order`,

      metadata: {
        cartItems: JSON.stringify(items),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}