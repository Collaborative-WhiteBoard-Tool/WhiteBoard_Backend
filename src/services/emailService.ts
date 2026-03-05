import { ENV } from '../config/env.js';
import { generateShareBoardEmail, ShareBoardEmailData } from '../utils/emailTemplates.js';

export const sendShareBoardEmail = async (data: ShareBoardEmailData): Promise<void> => {
    const apiKey = ENV.MAIL.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('⚠️ SendGrid API key missing!!');
        return;
    }

    const sgMail = (await import('@sendgrid/mail')).default;
    sgMail.setApiKey(apiKey);
    const { subject, html } = generateShareBoardEmail(data);

    await sgMail.send({
        from: `WhiteBoard App <${ENV.MAIL.MAIL_USER}>`,
        to: data.recipientEmail,
        subject,
        html,
    });

    console.log(`✅ Share email sent to ${data.recipientEmail}`);
};