import { Resend } from "resend";
import type { PendingOrder } from "@/app/lib/gsheet";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCustomerOrderConfirmation({
  orderId,
  customerName,
  customerEmail,
  orders,
}: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orders: PendingOrder[];
}) {
  if (!customerEmail) {
    console.warn(
      `Order ${orderId} has no customer email. Confirmation email skipped.`
    );
    return;
  }

  const orderItems = orders
    .map(
      (order) => `
        <div style="margin-bottom: 24px;">
          <h3 style="margin-bottom: 8px;">
            ${order.teamName}
          </h3>

          <p style="margin: 4px 0;">
            <strong>Color:</strong> ${order.color}
          </p>
          <p style="margin: 4px 0;">
            <strong>Size:</strong> ${order.size}
          </p>
          <p style="margin: 4px 0;">
            <strong>Cut:</strong> ${order.cut}
          </p>
          <p style="margin: 4px 0;">
            <strong>Neck:</strong> ${order.neckStyle}
          </p>
          <p style="margin: 4px 0;">
            <strong>Back:</strong> ${order.backStyle}
          </p>
          <p style="margin: 4px 0;">
            <strong>Name:</strong> ${order.printedName}
          </p>
          <p style="margin: 4px 0;">
            <strong>Number:</strong> ${order.printedNumber}
          </p>
          <p style="margin: 4px 0;">
            <strong>Pronouns:</strong> ${order.pronouns}
          </p>
          <p style="margin: 4px 0;">
            <strong>Quantity:</strong> ${order.qty}
          </p>
          <p style="margin: 4px 0;">
            <strong>Price:</strong> $${(
              order.itemPrice * order.qty
            ).toFixed(2)}
          </p>
        </div>
      `
    )
    .join("");


    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!fromEmail) {
      throw new Error("Missing RESEND_FROM_EMAIL environment variable");
    }

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: customerEmail,

    subject: `Pizza Heist Order Confirmation #${orderId}`,

    html: `
      <div style="
        max-width: 600px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        color: #142F42;
        line-height: 1.5;
      ">

        <h1>Transmission received!</h1>

        <p>
          Thanks for your order${
            customerName ? `, ${customerName}` : ""
          }!
        </p>

        <p>
          We've received your payment and your order is being processed.
        </p>

        <h2>Order #${orderId}</h2>

        ${orderItems}

        <hr style="margin: 32px 0;" />

        <p>
          We'll be in touch with additional information about
          pickup as your order moves through production.
        </p>

        <p>
          Questions? Contact us at
          <a href="mailto:agent@pizzaheistjerseys.com">
            agent@pizzaheistjerseys.com
          </a>.
        </p>

        <p>
          Steal the Track, Deliver the Heat.
        </p>

      </div>
    `,
  });

  if (error) {
    console.error(
      `Failed to send customer confirmation for Order ${orderId}:`,
      error
    );

    return;
  }

  console.log(
    `Customer confirmation sent for Order ${orderId}: ${data?.id}`
  );
}