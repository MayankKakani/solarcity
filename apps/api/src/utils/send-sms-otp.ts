import twilio from "twilio";
import { getTwilioCredentials, isTwilioConfigured } from "./twilio-env";

export async function sendSmsOtp(
  phoneNumber: string,
  code: string,
): Promise<void> {
  if (!isTwilioConfigured()) {
    console.warn(
      "[phoneNumber] Twilio is not configured; skipping SMS OTP send.",
    );
    return;
  }

  const { accountSid, authToken, fromPhoneNumber } = getTwilioCredentials();
  const client = twilio(accountSid, authToken);

  await client.messages.create({
    to: phoneNumber,
    from: fromPhoneNumber,
    body: `Your Solarplan verification code is ${code}`,
  });
}
