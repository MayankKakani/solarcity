export function getRazorpayCredentials(): {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
} {
  return {
    keyId: process.env.RAZORPAY_KEY_ID?.trim() || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET?.trim() || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || "",
  };
}

export function isRazorpayConfigured(): boolean {
  const { keyId, keySecret, webhookSecret } = getRazorpayCredentials();
  return Boolean(keyId && keySecret && webhookSecret);
}
