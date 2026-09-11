import Stripe from "stripe";
import Link from "next/link";
import styles from "./success.module.css";
import layoutStyles from "@/app/(home)/page.module.css";
import { findPendingOrder } from "@/app/lib/gsheet";
import ClearCart from "./clearCart";

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!);

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function SuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className={layoutStyles.page}>
        <main className={layoutStyles.main}>
            <div className={styles.cardNoSession}>
            <h1>Order Confirmation</h1>
            <p>
              We couldn't find your checkout session and are unable to confirm your order at this time. If you completed a payment, please contact us at <a href="mailto:agent@pizzaheistjerseys.com">agent@pizzaheistjerseys.com</a> and we'll be happy to help.
            </p>

            <Link href="/treasure-valley/order" className="button-secondary">
              Return to Pizza Heist
            </Link>
            </div>
        </main>
      </div>
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return (
        <main className={styles.page}>
          <div className={styles.container}>
            <h1>Payment Incomplete</h1>
            <p>
              It looks like your payment wasn't processed.
            </p>
          </div>
        </main>
      );
    }

    const orderId = session.metadata?.orderId;
    const orders = orderId ? await findPendingOrder(orderId): []
    const customerName = session.customer_details?.name;
    const email = session.customer_details?.email;

    return (
    <div className={layoutStyles.body}>
      <main className={layoutStyles.main}>
        <div className={styles.card}>
          <div className={styles.successHeader}>
            <h1>Transmission received!</h1>
            <p className={styles.thankYou}>
              Thanks for your order
              {customerName ? `, ${customerName}` : ""}!
            </p>

            {orderId && (
              <p className={styles.orderNumber}>
                Order <strong>#{orderId}</strong>
              </p>
            )}

            <div className={styles.message}>
              <p>
                We've received your payment and your order is being
                processed.
              </p>

              <p>
                We'll send an email to <span className={styles.email}>{email}</span> with your order details and updates on shipping or pickup where appropriate.
              </p>
            </div>
          </div>

          <div className={styles.orderDetailsWrapper}>
            <h2>Order Details:</h2>
            <div className={styles.orderDetails}>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <div
                  className={styles.orderItem}
                  key={`${order.orderId}-${index}`}
                >
                  <h3><span>{index+1}.</span> {order.teamName}</h3>
                  <div className={styles.details}>
                    <p>
                      <strong>Color:</strong> {order.color}
                    </p>

                    <p>
                      <strong>Size:</strong> {order.size}
                    </p>

                    <p>
                      <strong>Cut:</strong> {order.cut}
                    </p>

                    <p>
                      <strong>Neck:</strong> {order.neckStyle}
                    </p>

                    <p>
                      <strong>Back:</strong> {order.backStyle}
                    </p>

                    <p>
                      <strong>Name:</strong> {order.printedName}
                    </p>

                    <p>
                      <strong>Number:</strong> {order.printedNumber}
                    </p>

                    <p>
                      <strong>Pronouns:</strong> {order.pronouns}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {order.qty}
                    </p>
                    <p>${(order.itemPrice * order.qty).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>We're unable to display your order details right now.</p>
            )}
          </div>
          <ClearCart />
          </div>
          
          {/* TODO: Send this to last team store not home page */}
          <Link href="/treasure-valley/order" className="button-primary">
            Return to Shop
          </Link>
        </div>
      </main>
      </div>
    );
  } catch (error) {
    console.error("Unable to retrieve Stripe checkout session:", error);

    return (
      <main className={styles.main}>
        <div className={styles.cardNoSession}>
          <h1>Order Received!</h1>

          <p>
            Your payment was received, but we weren't able to load the
            full order details.
          </p>

          <p>
            Please keep your payment confirmation. If you have any
            questions about your order, contact us.
          </p>

          {/* TODO: Send this to last team store not home page */}
          <Link href="/treasure-valley/order" className="button-secondary">
            Return to Pizza Heist
          </Link>
        </div>
      </main>
    );
  }
}