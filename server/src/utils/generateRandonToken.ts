import crypto from "crypto";
export const generateEmailInviteToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return {
    token,
    hashedToken,
  };
};
