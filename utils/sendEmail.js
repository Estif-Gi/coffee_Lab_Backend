const nodemailer = require('nodemailer');
require('dotenv').config();

const successPage = require("./SuccessPage")

const transporter = nodemailer.createTransport({
    service: 'gmail',                    // Or use Brevo, SendGrid, Mailgun, etc.
    auth: {
        user: process.env.EMAIL_USER,    // e.g., yourgmail@gmail.com
        pass: process.env.EMAIL_PASS     // App password (not normal password)
    }
});

const sendVerificationEmail = async (email, token, userId) => {
    console.log('Preparing to send verification email to:', userId);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/api/users/verify-email/${userId}/${token}`;

    const mailOptions = {
        from: `"Coffee Lab" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
            <h2>Welcome to Coffee Lab!</h2>
            <p>Please click the link below to verify your email:</p>
            <a href="${verificationLink}" style="padding:10px 20px; background:#4CAF50; color:white; text-decoration:none;">
                Verify Email
            </a>
            <p>This link expires in 24 hours.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };