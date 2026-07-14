export function getWhatsappCredentials(): {
  accessToken: string;
  phoneNumberId: string;
  otpTemplateName: string;
  otpTemplateLanguage: string;
} {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN?.trim() || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || "",
    otpTemplateName:
      process.env.WHATSAPP_OTP_TEMPLATE_NAME?.trim() || "otp_login",
    otpTemplateLanguage:
      process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE?.trim() || "en_US",
  };
}

export function isWhatsappConfigured(): boolean {
  const { accessToken, phoneNumberId } = getWhatsappCredentials();
  return Boolean(accessToken && phoneNumberId);
}
