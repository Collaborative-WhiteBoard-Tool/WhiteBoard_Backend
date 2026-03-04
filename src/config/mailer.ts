import nodemailer from 'nodemailer';
import { ENV } from './env.js';

let transporter: nodemailer.Transporter | null = null;

if (ENV.MAIL.MAIL_USER && ENV.MAIL.MAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: ENV.MAIL.MAIL_USER,
            pass: ENV.MAIL.MAIL_PASSWORD,
        },
    });

    transporter.verify((error) => {
        if (error) {
            console.error('❌ Mail transporter error:', error);
        } else {
            console.log('✅ Mail server ready');
        }
    });
} else {
    console.warn('⚠️ Mail service disabled (missing env vars)');
}

export { transporter };