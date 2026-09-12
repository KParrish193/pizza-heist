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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const logoUrl = `${siteUrl}/logos/logo.svg`;



  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: customerEmail,
    replyTo: fromEmail,
    subject: `Pizza Heist Order Confirmation #${orderId}`,

    html: `
      <div style="
        max-width: 600px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        color: #242E2F;
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

        <h2 style="color: #C01B1C">Order #${orderId}</h2>

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
         <div style="
          text-align: center;
          padding: 24px 0;">
          <img
            src="${logoUrl}"
            alt="Pizza Heist Jerseys"
            width="220"
            style="
              display: block;
              width: 220px;
              max-width: 100%;
              height: auto;
              margin: 0 auto;
            "
          />
        </div>
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

export async function sendOwnerOrderNotification({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  orders,
}: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orders: PendingOrder[];
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const logoUrl = `${siteUrl}/logos/logo.svg`;

  const orderItems = orders
    .map(
      (order) => `
        <div style="
          margin-bottom: 24px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        ">
          <h3 style="margin-top: 0; color: #DD5339;">
            ${order.teamName}
          </h3>

          <p><strong>Color:</strong> ${order.color}</p>
          <p><strong>Size:</strong> ${order.size}</p>
          <p><strong>Cut:</strong> ${order.cut}</p>
          <p><strong>Neck:</strong> ${order.neckStyle}</p>
          <p><strong>Back:</strong> ${order.backStyle}</p>
          <p><strong>Name:</strong> ${order.printedName}</p>
          <p><strong>Number:</strong> ${order.printedNumber}</p>
          <p><strong>Pronouns:</strong> ${order.pronouns}</p>
          <p><strong>Quantity:</strong> ${order.qty}</p>

          <p style="
            margin-bottom: 0;
            font-size: 18px;
            font-weight: bold;
          ">
            $${(order.itemPrice * order.qty).toFixed(2)}
          </p>
        </div>
      `
    )
    .join("");

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: "riotatchya@gmail.com",
    // to: "agent@pizzaheistjerseys.com",
    replyTo: customerEmail || undefined,
    subject: `New Pizza Heist Order #${orderId}`,

    html: `
      <div style="
        max-width: 600px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        color: #142F42;
        line-height: 1.5;
      ">

        <!-- Header -->
        <div style="
          text-align: center;
          padding: 24px;
          background-color: #142F42;
        ">
          <img
            src="${logoUrl}"
            alt="Pizza Heist Jerseys"
            width="220"
            style="
              display: block;
              width: 220px;
              max-width: 100%;
              height: auto;
              margin: 0 auto;
            "
          />
        </div>

        <!-- Main content -->
        <div style="padding: 32px 24px;">

          <h1 style="
            margin-top: 0;
            color: #DD5339;
          ">
            New Order Received!
          </h1>

          <p style="font-size: 18px;">
            Order <strong>#${orderId}</strong> has been paid and is ready
            for fulfillment.
          </p>

          <!-- Customer -->
          <div style="
            margin: 24px 0;
            padding: 20px;
            background-color: #f5f5f5;
            border-radius: 8px;
          ">
            <h2 style="margin-top: 0;">
              Customer
            </h2>

            <p>
              <strong>Name:</strong>
              ${customerName || "Not provided"}
            </p>

            <p>
              <strong>Email:</strong>
              ${customerEmail || "Not provided"}
            </p>

            <p>
              <strong>Phone:</strong>
              ${customerPhone || "Not provided"}
            </p>
          </div>

          <!-- Orders -->
          <h2>Jersey Details</h2>

          ${orderItems}

          <!-- Fulfillment -->
          <div style="
            margin-top: 24px;
            padding: 20px;
            border-top: 3px solid #B6F16A;
          ">
            <h2>Fulfillment</h2>

            <p>
              <strong>Pickup:</strong>
              In person
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="
          padding: 24px;
          text-align: center;
          background-color: #142F42;
          color: white;
        ">
          <p style="margin: 0;">
            Steal the Track, Deliver the Heat. 🍕
          </p>
        </div>

      </div>
    `,
  });

  if (error) {
    console.error(
      `Failed to send owner notification for Order ${orderId}:`,
      error
    );
    return;
  }

  console.log(
    `Owner notification sent for Order ${orderId}: ${data?.id}`
  );
}