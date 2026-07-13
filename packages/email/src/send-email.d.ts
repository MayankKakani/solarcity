// biome-ignore-all lint/suspicious/noIrregularWhitespace: <ignore>
import type { MagicLinkEmailProps } from "./templates/magic-link";
import type { NotificationEmailProps } from "./templates/notification";
import type { OtpEmailProps } from "./templates/otp";
import type { PasswordResetEmailProps } from "./templates/password-reset";
import type { WorkspaceInvitationEmailProps } from "./templates/workspace-invitation";
export declare const sendMagicLinkEmail: (
  to: string,
  subject: string,
  data: MagicLinkEmailProps,
) => Promise<void>;
export declare const sendOtpEmail: (
  to: string,
  subject: string,
  data: OtpEmailProps,
) => Promise<void>;
export declare const sendPasswordResetEmail: (
  to: string,
  subject: string,
  data: PasswordResetEmailProps,
) => Promise<void>;
export type EmailResult = {
  success: boolean;
  reason?: "SMTP_NOT_CONFIGURED";
};
export declare const sendWorkspaceInvitationEmail: (
  to: string,
  subject: string,
  data: WorkspaceInvitationEmailProps,
) => Promise<EmailResult>;
export declare const sendNotificationEmail: (
  to: string,
  subject: string,
  data: NotificationEmailProps,
) => Promise<EmailResult>;
//# sourceMappingURL=send-email.d.ts.map
