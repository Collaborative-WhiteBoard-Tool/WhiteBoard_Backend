import nodemailer from 'nodemailer';
import { ENV } from './env.js';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENV.MAIL.MAIL_USER,     
        pass: ENV.MAIL.MAIL_PASSWORD,  
    },
});

// Verify connection
transporter.verify((error) => {
    if (error) {
        console.error('❌ Mail transporter error:', error);
    } else {
        console.log('✅ Mail server ready');
    }
});