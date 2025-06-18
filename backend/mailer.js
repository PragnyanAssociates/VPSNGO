// 📂 File: backend/mailer.js (COMPLETE - NO CHANGES NEEDED)

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendPasswordResetEmail = (recipientEmail, resetToken) => {
    const resetUrl = `vspngo://reset-password/${resetToken}`;

    const mailOptions = {
        from: `"${process.env.SCHOOL_NAME || 'Vivekananda Public School'}" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
                    <h2 style="color: #008080;">Password Reset Request</h2>
                    <p>You requested a password reset for your account with ${process.env.SCHOOL_NAME || 'our school app'}.</p>
                    <p>Please click the link below to set a new password. This link is valid for 1 hour.</p>
                    <a 
                        href="${resetUrl}" 
                        style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Reset Your Password
                    </a>
                    <p style="margin-top: 20px; font-size: 12px; color: #777;">
                        If you did not request a password reset, please ignore this email. Your account is secure.
                    </p>
                </div>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };