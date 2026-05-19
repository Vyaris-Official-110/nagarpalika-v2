/**
 * SMS Service — Stub implementation
 *
 * SWAP TO PRODUCTION: Replace sendRaw() with your BSP's HTTP API
 * (Textlocal / MSG91 / Fast2SMS / any gateway).
 * Interface: sendSmsOtp(phone, otp) and sendSmsText(phone, message)
 * must return { success: boolean, reason?: string }
 */

const isDev = process.env.NODE_ENV !== "production";

async function sendRaw(phone, message) {
  if (isDev) {
    console.log(`[SMS STUB] To: ${phone} | Message: ${message}`);
    return { success: true, stub: true };
  }

  // TODO: wire BSP here
  // const SMS_API_KEY = process.env.SMS_API_KEY;
  // const SMS_SENDER  = process.env.SMS_SENDER_ID;
  // const res = await fetch(`https://api.example-bsp.com/send?...`);
  // return res.ok ? { success: true } : { success: false, reason: "api_error" };

  console.warn("[SMS] Production SMS not configured — message not sent");
  return { success: false, reason: "not_configured" };
}

export const sendSmsOtp = (phone, otp) =>
  sendRaw(
    phone,
    `Your NagarPalika OTR verification code is ${otp}. Valid for 5 minutes. Do not share.`
  );

export const sendSmsText = (phone, message) => sendRaw(phone, message);
