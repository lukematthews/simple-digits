import { Injectable } from "@nestjs/common";

// email.service.ts
@Injectable()
export class EmailService {
  async sendInviteEmail(email: string, context: { inviter: string; budgetName: string; token: string }) {
    const link = `https://your-app.com/invite/accept?token=${context.token}`;
    console.log(`Sending invite to ${email}...`, { link });
    // Replace with actual email logic (e.g. using nodemailer, Resend, Mailgun)
  }
}
