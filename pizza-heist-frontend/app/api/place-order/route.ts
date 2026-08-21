// code to post form data - TODO update to include multiple lines (multiple jersy options), and paymenmt status

import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  return new google.auth.GoogleAuth({
    credentials: {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function POST(req: Request) {
  // generate unique submission ID per request
  const team = "add code to dynamically pull team from url/sheetsTab"
  const submissionId = `PH-${team}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  
  // generate timestamp
  const timestamp = new Intl.DateTimeFormat("en-US", {
    timeZone: "Mountain/Denver",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
  const displayTimestamp = `${timestamp} MST`;

  const auth = getSheetsClient();
  const sheets = google.sheets({ version: "v4", auth });

  const body = await req.json();
  let sheetStatus = `pending`;
  let emailStatus = "pending";

  // Step 1: Append data to Google Sheets
  try { 
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "Contact!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
            submissionId,
            displayTimestamp,
            body.firstName,
            body.lastName,
            body.phone,
            body.email,
            body.jobType,
            body.description,
        ]],
      },
    });
    sheetStatus = `success`;
  } catch (err: unknown) {
      sheetStatus = 
        err instanceof Error ? `error: ${err.message}` : 
      sheetStatus = "error: unknown error";
  }

  //Step 2: Send email with Resend
  try {
    const { error } = await resend.emails.send({
      from: `Gourley Tree Removal Site: <${process.env.EMAIL_FROM}>`,
      to: `${process.env.EMAIL_TO}`,
      subject: `New Contact Form Submission: ${submissionId}`,
      replyTo: body.email,
      template: {
        id: 'form-submission',
        variables: {
          SUBMISSION_ID: submissionId,
          TIMESTAMP: displayTimestamp,
          CUSTOMER_FIRST_NAME: body.firstName,
          CUSTOMER_LAST_NAME: body.lastName,
          CUSTOMER_PHONE: body.phone,
          CUSTOMER_EMAIL: body.email,
          JOB_TYPE: body.jobType,
          JOB_DESCRIPTION: body.description
        },
      },
    });

    if (error) throw new Error(error.message);
    emailStatus = "success";
  } catch (err: unknown) {
    emailStatus =
      err instanceof Error ? `error: ${err.message}` : "error: unknown error";
  }

  return NextResponse.json({
    ok: sheetStatus === "success" && emailStatus === "success",
    sheetStatus,
    emailStatus,
  });
}
