import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  findPendingOrder,
  updatePendingOrder,
  addPaidOrder,
} from "@/app/lib/gsheet";

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const orderId = session.metadata?.orderId;

        if (!orderId) {
          throw new Error(
            `Stripe session ${session.id} is missing an orderId.`
          );
        }

        console.log(
          `Processing completed checkout for Order ${orderId}`
        );

        const pendingOrders = await findPendingOrder(orderId);

        if (pendingOrders.length === 0) {
          throw new Error(
            `No PendingOrders found for Order ID ${orderId}.`
          );
        }

        /*
         * Prevent duplicate processing if Stripe retries
         * the webhook.
         */
        const alreadyPaid = pendingOrders.every(
          (order) => order.status === "Paid"
        );

        if (alreadyPaid) {
          console.log(
            `Order ${orderId} has already been processed.`
          );

          break;
        }

        const customer = session.customer_details;

        const billingFirstName =
          customer?.name?.split(" ")[0] || "";

        const billingLastName =
          customer?.name
            ?.split(" ")
            .slice(1)
            .join(" ") || "";

        const email = customer?.email || "";

        const phone = customer?.phone || "";

        const taxCollected =
          (session.total_details?.amount_tax || 0) / 100;

        /*
         * Pickup is currently free.
         *
         * When we add Stripe shipping options later,
         * this will come from Stripe instead.
         */
        const shippingPrice = 0;

        /*
         * Mark all PendingOrders rows as paid.
         */
        await updatePendingOrder(orderId, {
          stripeSessionId: session.id,
          status: "Paid",
        });

        /*
         * Write each jersey to its team's order tab.
         */
        for (const order of pendingOrders) {
          await addPaidOrder(order, {
            stripeSessionId: session.id,
            paid: "Yes",
            shippingPrice,
            taxCollected,
            billingFirstName,
            billingLastName,
            email,
            phone,
          });
        }

        console.log(
          `Successfully processed Order ${orderId}`
        );

        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}