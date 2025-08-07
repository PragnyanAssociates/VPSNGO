// 📂 File: backend/mailer.js (CORRECTED FOR OTP/CODE METHOD)

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ --- STEP 2: MAILER CORRECTION --- ✅

// This function now sends a simple email with a 6-digit code.
const sendPasswordResetCode = async (recipientEmail, resetCode) => {
    const schoolName = process.env.SCHOOL_NAME || 'Vivekananda Public School';

    const mailOptions = {
        from: `"${schoolName}" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Your Password Reset Code',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
                <div style="background-color: #e0f2f7; padding: 15px; border-bottom: 1px solid #ddd; text-align: center;">
                    <h2 style="color: #008080; margin: 0;">Password Reset Request</h2>
                </div>
                <div style="padding: 20px; text-align: center;">
                    <p>You requested a password reset. Please use the following code to reset your password.</p>
                    
                    <p style="font-size: 28px; font-weight: bold; color: #008080; letter-spacing: 5px; margin: 25px 0; padding: 10px; background-color: #f4f4f4; border-radius: 5px;">
                        ${resetCode}
                    </p>

                    <p style="font-size: 14px; color: #555;">
                        This code is valid for 10 minutes.
                    </p>
                    
                    <p style="margin-top: 25px; font-size: 12px; color: #777;">
                        If you did not request a password reset, please ignore this email.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset code sent successfully to ${recipientEmail}.`);
    } catch (error) {
        console.error(`❌ Failed to send password reset code to ${recipientEmail}. Nodemailer error:`, error);
        throw error;
    }
};

// We export the new function name.
module.exports = { sendPasswordResetCode };