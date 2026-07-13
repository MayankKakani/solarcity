var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        // biome-ignore lint/style/noParameterAssign: <igonre>
        k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        // biome-ignore lint/style/noParameterAssign: <igonre>
        k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      var result = {};
      var k;
      if (mod != null)
        for (k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  // biome-ignore lint/complexity/useOptionalChain: <igonre>
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationEmail =
  exports.sendWorkspaceInvitationEmail =
  exports.sendPasswordResetEmail =
  exports.sendOtpEmail =
  exports.sendMagicLinkEmail =
    void 0;
const components_1 = require("@react-email/components");
const dotenv_mono_1 = require("dotenv-mono");
const nodemailer = __importStar(require("nodemailer"));
const magic_link_1 = __importDefault(require("./templates/magic-link"));
const notification_1 = __importDefault(require("./templates/notification"));
const otp_1 = __importDefault(require("./templates/otp"));
const password_reset_1 = __importDefault(require("./templates/password-reset"));
const workspace_invitation_1 = __importDefault(
  require("./templates/workspace-invitation"),
);
// biome-ignore lint/complexity/noCommaOperator: <ignore>
(0, dotenv_mono_1.config)();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  secure: process.env.SMTP_SECURE !== "false",
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  requireTLS: process.env.SMTP_REQUIRE_TLS === "true",
  ignoreTLS: process.env.SMTP_IGNORE_TLS === "true",
});
const sendMagicLinkEmail = async (to, subject, data) => {
  // biome-ignore lint/complexity/noCommaOperator: <ignore>
  const emailTemplate = await (0, components_1.render)(
    // biome-ignore lint/complexity/noCommaOperator: <ignore>
    (0, magic_link_1.default)(data),
  );
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: emailTemplate,
    });
  } catch (error) {
    console.error("Error sending magic link email", error);
  }
};
exports.sendMagicLinkEmail = sendMagicLinkEmail;
const sendOtpEmail = async (to, subject, data) => {
  // biome-ignore lint/complexity/noCommaOperator: <ignore>
  const emailTemplate = await (0, components_1.render)(
    // biome-ignore lint/complexity/noCommaOperator: <ignore>
    (0, otp_1.default)(data),
  );
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: emailTemplate,
    });
  } catch (error) {
    console.error("Error sending OTP email", error);
  }
};
exports.sendOtpEmail = sendOtpEmail;
const sendPasswordResetEmail = async (to, subject, data) => {
  // biome-ignore lint/complexity/noCommaOperator: <ignore>
  const emailTemplate = await (0, components_1.render)(
    // biome-ignore lint/complexity/noCommaOperator: <ignore>
    (0, password_reset_1.default)(data),
  );
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: emailTemplate,
    });
  } catch (error) {
    console.error("Error sending password reset email", error);
  }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendWorkspaceInvitationEmail = async (to, subject, data) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    return { success: false, reason: "SMTP_NOT_CONFIGURED" };
  }
  try {
    // biome-ignore lint/complexity/noCommaOperator: <ignore>
    const emailTemplate = await (0, components_1.render)(
      // biome-ignore lint/complexity/noCommaOperator: <ignore>
      (0, workspace_invitation_1.default)({ ...data, to }),
    );
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: emailTemplate,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending workspace invitation email", error);
    throw error;
  }
};
exports.sendWorkspaceInvitationEmail = sendWorkspaceInvitationEmail;
const sendNotificationEmail = async (to, subject, data) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    return { success: false, reason: "SMTP_NOT_CONFIGURED" };
  }
  try {
    // biome-ignore lint/complexity/noCommaOperator: <ignore>
    const emailTemplate = await (0, components_1.render)(
      // biome-ignore lint/complexity/noCommaOperator: <ignore>
      (0, notification_1.default)(data),
    );
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: emailTemplate,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending notification email", error);
    throw error;
  }
};
exports.sendNotificationEmail = sendNotificationEmail;
