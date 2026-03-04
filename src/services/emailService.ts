import { Resend } from 'resend';
import { ENV } from '../config/env.js';
import { generateShareBoardEmail, ShareBoardEmailData } from '../utils/emailTemplates.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendShareBoardEmail = async (
    data: ShareBoardEmailData
): Promise<void> => {
    if (!ENV.MAIL.RESEND_API_KEY) {
        console.warn('⚠️ Resend API key missing, skip sending email');
        return;
    }

    const { subject, html } = generateShareBoardEmail(data);

    await resend.emails.send({
        from: 'WhiteBoard App <onboarding@resend.dev>',
        to: data.recipientEmail,
        subject,
        html,
    });

    console.log(`✅ Share email sent to ${data.recipientEmail}`);
};