import { NextResponse } from "next/server";
import Stripe from "stripe";
import { randomBytes } from "crypto";
import {
  addPendingOrder,
  updatePendingOrder,
  fetchTeamById,
} from "@/app/lib/gsheet";
import { calculatePriceByTeam } from "@/app/lib/pricing";

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

    const orderId = randomBytes(4).toString("hex").toUpperCase();

    const createdAt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Denver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(new Date());

    /*
     * Validate all cart items and build the Stripe line items.
     */
    const validatedItems = await Promise.all(
      items.map(async (item: any) => {
        const team = await fetchTeamById(item.teamId);

        if (!team || !team.active) {
          throw new Error(
            `The store for ${item.teamName} is no longer available.`
          );
        }

        const price = calculatePriceByTeam(team);

        return {
          item,
          team,
          price,
        };
      })
    );

    /*
     * Create PendingOrders rows.
     *
     * We intentionally write these BEFORE Stripe checkout.
     * StripeSessionId is temporarily blank and will be filled in
     * after Stripe successfully creates the session.
     */
    for (const { item, team, price } of validatedItems) {
      await addPendingOrder({
        createdAt,
        stripeSessionId: "",
        orderId,
        teamId: team.id,
        teamName: team.name,
        teamSlug: team.slug,
        color: item.color || "",
        size: item.size || "",
        cut: item.cut || "",
        neckStyle: item.neckStyle || "",
        backStyle: item.backStyle || "",
        printedName: item.jerseyName || "",
        printedNumber: item.jerseyNumber || "",
        pronouns: item.pronouns || "",
        qty: item.quantity,
        itemPrice: price,
        discountType: team.pricingType || "",
        shippingFormat: "pickup",
        status: "Pending",
      });
    }

    /*
     * Build Stripe line items.
     */
    const lineItems = validatedItems.map(({ item, team, price }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Custom ${team.name} Jersey - ${item.color || ""}`,
          description: [
            `Size: ${item.size}`,
            `Cut: ${item.cut}`,
            `Length: ${item.length}`,
            `Neck: ${item.neckStyle}`,
            `Back: ${item.backStyle}`,
            `Color: ${item.color}`,
            `Number: ${item.jerseyNumber}`,
            `Name: ${item.jerseyName}`,
            item.pronouns ? `Pronouns: ${item.pronouns}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: item.quantity,
    }));

    /*
     * Create Stripe Checkout session.
     */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${items[0].teamSlug}/order`,

      metadata: {
        orderId,
      },
    });

    /*
     * Now that Stripe has created the session, attach the
     * Stripe session ID to our PendingOrders rows.
     */
    await updatePendingOrder(orderId, {
      stripeSessionId: session.id,
    });

    return NextResponse.json({
      url: session.url,
      orderId,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}