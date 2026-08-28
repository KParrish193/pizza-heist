import { google } from "googleapis";
import type { Team } from "@/app/components/ordering/team/teamContext";

export type SheetRow = { [key: string]: string };

export interface PendingOrder {
  createdAt: string;
  stripeSessionId: string;
  orderId: string;
  teamId: string;
  teamName: string;
  teamSlug: string;
  color: string;
  size: string;
  cut: string;
  neckStyle: string;
  backStyle: string;
  printedName: string;
  printedNumber: string;
  pronouns: string;
  qty: number;
  itemPrice: number;
  discountType: string;
  shippingFormat: string;
  status: string;
}

export interface PaidOrderData {
  stripeSessionId: string;
  paid: string;
  shippingPrice: number;
  taxCollected: number;
  billingFirstName: string;
  billingLastName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
}

/**
 * Google Sheets client
 *
 * Used for both reading and writing.
 */
export function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL env var");
  }

  if (!privateKey) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY env var");
  }

  privateKey = privateKey.replace(/\\n/g, "\n").trim();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({
    version: "v4",
    auth,
  });
}

/**
 * Fetch data from the content spreadsheet.
 */
export async function fetchSheetData(
  tabName: string,
  range: string
): Promise<SheetRow[]> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_CONTENT;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID_CONTENT env var");
  }

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!${range}`,
    });

    const rows = res.data.values ?? [];

    if (rows.length === 0) {
      return [];
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows.map((row) => {
      const obj: SheetRow = {};

      headers.forEach((header, i) => {
        obj[header] = row[i] || "";
      });

      return obj;
    });
  } catch (err: unknown) {
    console.error("Error fetching Google Sheet data:", err);
    throw err;
  }
}

/**
 * Fetch a team by its URL slug.
 */
export async function fetchTeamBySlug(
  slug: string
): Promise<Team | null> {
  const rows = await fetchSheetData("TeamConfigs", "B:N");

  const row = rows.find(
    (team) => team["Slug"]?.toLowerCase() === slug.toLowerCase()
  );

  if (!row) {
    return null;
  }

  return {
    slug: row["Slug"],
    id: row["Team Id"],
    name: row["Team Name"],
    basePrice: Number(row["Base Price"]),
    discountPercentage: Number(row["Discount Percentage"] || 0),
    salePrice: Number(row["Sale Price"] || 0),
    pricingType: row["Pricing Type"],
    active: row["Active"]?.toLowerCase() === "true",
    pickupAvailable:
      row["Pickup Available"]?.toLowerCase() === "true",
    tabName: row["TabName"],
  };
}

/**
 * Fetch a team by its Team Id.
 */
export async function fetchTeamById(
  id: string
): Promise<Team | null> {
  const rows = await fetchSheetData("TeamConfigs", "B:N");

  const row = rows.find(
    (team) => team["Team Id"]?.toLowerCase() === id.toLowerCase()
  );

  if (!row) {
    return null;
  }

  return {
    slug: row["Slug"],
    id: row["Team Id"],
    name: row["Team Name"],
    basePrice: Number(row["Base Price"]),
    discountPercentage: Number(row["Discount Percentage"] || 0),
    salePrice: Number(row["Sale Price"] || 0),
    pricingType: row["Pricing Type"],
    active: row["Active"]?.toLowerCase() === "true",
    pickupAvailable:
      row["Pickup Available"]?.toLowerCase() === "true",
    tabName: row["TabName"],
  };
}

/**
 * Add a jersey line to PendingOrders.
 */
export async function addPendingOrder(
  order: PendingOrder
): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_ORDERS;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID_ORDERS env var");
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "PendingOrders!A:S",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        order.createdAt,
        order.stripeSessionId,
        order.orderId,
        order.teamId,
        order.teamName,
        order.teamSlug,
        order.color,
        order.size,
        order.cut,
        order.neckStyle,
        order.backStyle,
        order.printedName,
        order.printedNumber,
        order.pronouns,
        order.qty,
        order.itemPrice,
        order.discountType,
        order.shippingFormat,
        order.status,
      ]],
    },
  });
}

/**
 * Find all pending rows associated with an Order ID.
 */
export async function findPendingOrder(
  orderId: string
): Promise<PendingOrder[]> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_ORDERS;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID_ORDERS env var");
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "PendingOrders!A:S",
  });

  const rows = res.data.values ?? [];

  if (rows.length <= 1) {
    return [];
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return dataRows
    .map((row) => {
      const obj: SheetRow = {};

      headers.forEach((header, i) => {
        obj[header] = row[i] || "";
      });

      return {
        createdAt: obj["CreatedAt"],
        stripeSessionId: obj["StripeSessionId"],
        orderId: obj["OrderId"],
        teamId: obj["TeamId"],
        teamName: obj["TeamName"],
        teamSlug: obj["TeamSlug"],
        color: obj["Color"],
        size: obj["Size"],
        cut: obj["Cut"],
        neckStyle: obj["NeckStyle"],
        backStyle: obj["BackStyle"],
        printedName: obj["PrintedName"],
        printedNumber: obj["PrintedNumber"],
        pronouns: obj["Pronouns"],
        qty: Number(obj["Qty"] || 0),
        itemPrice: Number(obj["ItemPrice"] || 0),
        discountType: obj["DiscountType"],
        shippingFormat: obj["ShippingFormat"],
        status: obj["Status"],
      };
    })
    .filter((order) => order.orderId === orderId);
}

/**
 * Update PendingOrders rows for an Order ID.
 */
export async function updatePendingOrder(
  orderId: string,
  updates: {
    stripeSessionId?: string;
    status?: string;
  }
): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_ORDERS;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID_ORDERS env var");
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "PendingOrders!A:S",
  });

  const rows = res.data.values ?? [];

  if (rows.length <= 1) {
    throw new Error(`No PendingOrders found for Order ID ${orderId}`);
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // OrderId = column C
    if (row[2] !== orderId) {
      continue;
    }

    const sheetRowNumber = i + 1;

    // StripeSessionId = column B
    if (updates.stripeSessionId !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `PendingOrders!B${sheetRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[updates.stripeSessionId]],
        },
      });
    }

    // Status = column S
    if (updates.status !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `PendingOrders!S${sheetRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[updates.status]],
        },
      });
    }
  }
}

/**
 * Add a completed order to the appropriate team order tab.
 */
export async function addPaidOrder(
  order: PendingOrder,
  paidData: PaidOrderData
): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_ORDERS;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID_ORDERS env var");
  }

  const team = await fetchTeamById(order.teamId);

  if (!team?.tabName) {
    throw new Error(
      `No order tab configured for team ${order.teamName}`
    );
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${team.tabName}!A:AC`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        order.createdAt,              // A CreatedAt
        paidData.stripeSessionId,     // B StripeSessionId
        order.orderId,                // C OrderId
        order.teamId,                 // D TeamId
        order.teamName,               // E TeamName
        order.color,                  // F Color
        order.size,                   // G Size
        order.cut,                    // H Cut
        order.neckStyle,              // I NeckStyle
        order.backStyle,              // J BackStyle
        order.printedName,            // K PrintedName
        order.printedNumber,          // L PrintedNumber
        order.pronouns,               // M Pronouns
        order.qty,                    // N Qty
        order.itemPrice,              // O ItemPrice
        order.discountType,           // P DiscountType
        "Paid",                       // Q Status
        order.shippingFormat,         // R ShippingFormat
        paidData.shippingPrice,       // S ShippingPrice
        paidData.taxCollected,        // T TaxCollected
        paidData.billingFirstName,    // U BillingFirstName
        paidData.billingLastName,     // V BillingLastName
        paidData.email,               // W Email
        paidData.phone,               // X Phone
        paidData.shippingAddress,     // Y ShippingAddress
        paidData.shippingCity,        // Z ShippingCity
        paidData.shippingState,       // AA ShippingState
        paidData.shippingZip,         // AB ShippingZip
        paidData.shippingCountry,     // AC ShippingCountry
      ]],
    },
  });
}