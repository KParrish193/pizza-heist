import Stripe from "stripe";
import Link from "next/link";
import styles from "./success.module.css";
import layoutStyles from "../../page.module.css"

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
            <div className={styles.card}>
            <h1>Order Confirmation</h1>
            <p>
                We couldn't find your checkout session and are unable to confirm your order at this time. If you completed a
                payment, please contact us and we'll be happy to help.
            </p>

            {/* add an email button */}

            <Link href="/" className={styles.button}>
                Return to Pizza Heist
            </Link>
            </div>
        </main>
      </div>
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const orderId = session.metadata?.orderId;
    const customerName = session.customer_details?.name;

    return (
    <div className={layoutStyles.body}>
      <main className={layoutStyles.main}>
        <div className={styles.card}>
          <div className={styles.icon}>✓</div>

          <h1>Order Confirmed!</h1>

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
              We'll send you an email with your order details and
              additional information about pickup or shipping.
            </p>
          </div>

          <Link href="/" className={styles.button}>
            Continue Shopping
          </Link>
        </div>
      </main>
      </div>
    );
  } catch (error) {
    console.error("Unable to retrieve Stripe checkout session:", error);

    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <h1>Order Received!</h1>

          <p>
            Your payment was received, but we weren't able to load the
            full order details.
          </p>

          <p>
            Please keep your payment confirmation. If you have any
            questions about your order, contact us.
          </p>

          <Link href="/" className={styles.button}>
            Return to Pizza Heist
          </Link>
        </div>
      </main>
    );
  }
}