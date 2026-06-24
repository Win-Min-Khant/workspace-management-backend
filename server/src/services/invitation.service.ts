import { Invitation } from "../models/invitation.model.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { generateEmailInviteToken } from "../utils/generateRandomToken.js";
import { getInviteEmailTemplate } from "../utils/inviteEmailTemplate.js";
import sendEmail from "../utils/sendEmail.js";

export class InvitationService {
  static async sendInvitation(
    emails: string[],
    workspaceId: string,
    invitedBy: string,
    role: "admin" | "member",
  ) {
    const invitations = [];
    for (const email of emails) {
      const { token, hashedToken } = generateEmailInviteToken();
      try {
        const inviteUrl = `${process.env.CLIENT_URL}/accept-invitation/${token}`;
        await sendEmail({
          email,
          subject: "Invitation Request",
          html: getInviteEmailTemplate(inviteUrl),
        });
        const invite = await Invitation.create({
          email,
          workspaceId,
          inviteToken: hashedToken,
          invitedBy,
          role,
          inviteTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        invitations.push(invite);
      } catch (error) {
        console.log(`Error at sending invite email: ${error}`);
        throw error;
      }
    }
    return invitations;
  }
}
