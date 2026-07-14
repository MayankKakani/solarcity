import { getWhatsappCredentials, isWhatsappConfigured } from "./whatsapp-env";

const GRAPH_API_VERSION = "v21.0";

export async function sendWhatsappOtp(
  phoneNumber: string,
  code: string,
): Promise<void> {
  if (!isWhatsappConfigured()) {
    console.warn(
      "[phoneNumber] WhatsApp is not configured; skipping OTP send.",
    );
    return;
  }

  const { accessToken, phoneNumberId, otpTemplateName, otpTemplateLanguage } =
    getWhatsappCredentials();
  const to = phoneNumber.replace(/[^0-9]/g, "");

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: otpTemplateName,
          language: { code: otpTemplateLanguage },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: code }],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: code }],
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to send WhatsApp OTP: ${response.status} ${errorBody}`,
    );
  }
}
