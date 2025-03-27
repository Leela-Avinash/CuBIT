import nodemailer from "nodemailer";

export const sendResetEmail = async (to, token) => {
    let transporter = nodemailer.createTransport({
        service: "gmail", // or your preferred email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Password Reset Request",
        text: `You requested a password reset. Use the following token to reset your password: ${token}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Password reset email sent");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
