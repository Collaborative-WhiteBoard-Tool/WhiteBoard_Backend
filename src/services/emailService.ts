import { ENV } from '../config/env.js';
import { transporter } from '../config/mailer.js';
import { generateShareBoardEmail, ShareBoardEmailData } from '../utils/emailTemplates.js';

export const sendShareBoardEmail = async (data: ShareBoardEmailData): Promise<void> => {
    const { subject, html } = generateShareBoardEmail(data);

    await transporter.sendMail({
        from: `"WhiteBoard App" <${ENV.MAIL.MAIL_USER}>`,
        to: data.recipientEmail,
        subject,
        html,
    });

    console.log(`✅ Share email sent to ${data.recipientEmail}`);
};