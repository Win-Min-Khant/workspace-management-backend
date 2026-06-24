export const getInviteEmailTemplate = (url: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333;">You're invited to a workspace!</h2>
      <p style="color: #555;">Hello! You have been invited to join a workspace in our platform. Click the button below to accept the invitation.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      
      <p style="color: #888; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      <p style="color: #888; font-size: 12px;">This link will expire in 24 hours.</p>
    </div>
  `;
};
