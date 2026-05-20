import nodemailer from "nodemailer";

const isDev = process.env.NODE_ENV !== "production";

function createTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendEmail({ to, subject, text, html }) {
  if (isDev) {
    console.log(`[email.service] To:${to} | Subject:${subject}`);
    if (text) console.log(`[email.service] Body: ${text}`);
    return;
  }
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[email.service] SMTP not configured — email not sent");
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "NagarPalika Portal <noreply@nagarpalika.gov.in>",
    to,
    subject,
    text,
    html,
  });
}
