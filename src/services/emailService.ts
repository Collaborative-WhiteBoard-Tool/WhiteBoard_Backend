
import { ENV } from '../config/env.js';
import { generateShareBoardEmail, ShareBoardEmailData } from '../utils/emailTemplates.js';

export const sendShareBoardEmail = async (
    data: ShareBoardEmailData
): Promise<void> => {
    const apiKey = ENV.MAIL.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('⚠️ Resend API key missing, skip sending email');
        return;
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    console.log('mailKey:', resend.apiKeys.list())
    const { subject, html } = generateShareBoardEmail(data);

    await resend.emails.send({
        from: 'WhiteBoard App <onboarding@resend.dev>',
        to: data.recipientEmail,
        subject,
        html,
    });

    console.log(`✅ Share email sent to ${data.recipientEmail}`);
};