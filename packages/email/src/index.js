Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWorkspaceInvitationEmail =
  exports.sendPasswordResetEmail =
  exports.sendOtpEmail =
  exports.sendNotificationEmail =
  exports.sendMagicLinkEmail =
    void 0;
var send_email_1 = require("./send-email");
Object.defineProperty(exports, "sendMagicLinkEmail", {
  enumerable: true,
  get: () => send_email_1.sendMagicLinkEmail,
});
Object.defineProperty(exports, "sendNotificationEmail", {
  enumerable: true,
  get: () => send_email_1.sendNotificationEmail,
});
Object.defineProperty(exports, "sendOtpEmail", {
  enumerable: true,
  get: () => send_email_1.sendOtpEmail,
});
Object.defineProperty(exports, "sendPasswordResetEmail", {
  enumerable: true,
  get: () => send_email_1.sendPasswordResetEmail,
});
Object.defineProperty(exports, "sendWorkspaceInvitationEmail", {
  enumerable: true,
  get: () => send_email_1.sendWorkspaceInvitationEmail,
});
