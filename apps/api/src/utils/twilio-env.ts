export function getTwilioCredentials(): {
  accountSid: string;
  authToken: string;
  fromPhoneNumber: string;
} {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID?.trim() || "",
    authToken: process.env.TWILIO_AUTH_TOKEN?.trim() || "",
    fromPhoneNumber: process.env.TWILIO_PHONE_NUMBER?.trim() || "",
  };
}

export function isTwilioConfigured(): boolean {
  const { accountSid, authToken, fromPhoneNumber } = getTwilioCredentials();
  return Boolean(accountSid && authToken && fromPhoneNumber);
}
