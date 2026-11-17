
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();



const transporter = nodemailer.createTransport({
    // host: "gmail",
    service: "gmail",
    // port: Number(process.env.SMTP_PORT) || 587,
    // secure: process.env.SMTP_SECURE === "true",

    auth: {
        user: "tktejas407@gmail",
        pass: "ojvm ihsi vdwb rwsk",
    },
});



transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Connection Failed:", error);
    } else {
        console.log("SMTP Server Ready");
    }
});


export const sendEmail = async ({ sendTo, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Avyadhik Corporation" <${process.env.SMTP_USER}>`,
            to: sendTo,
            subject: subject,
            html: html,
        });

        console.log("Email sent successfully:", info.messageId);

        return info;

    } catch (error) {
        console.error("Email sending failed:", error);
        return null;
    }
};
