
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// // Gmail credentials
// const user_email = process.env.SMTP_USER;
// const user_pass = process.env.SMTP_PASS;



// // Gmail transporter
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: user_email,
//         pass: user_pass,
//     },
// });

// // Verify Gmail connection
// transporter.verify()
//     .then(() => {
//         console.log("Gmail Server Ready");
//     })
//     .catch((error) => {
//         console.error("Gmail Connection Failed:", error.message);
//     });

// // Send email function
// export const sendEmail = async ({ sendTo, subject, html }) => {
//     try {
//         const info = await transporter.sendMail({
//             from: `"Avyadhik Corporation" <"conpany@gmail.com">`,
//             to: sendTo,
//             subject,
//             html,
//         });

//         console.log("Email sent successfully:", info.messageId);

//         return info;

//     } catch (error) {
//         console.error("Email sending failed:", error.message);
//         throw error;
//     }
// };

// export default transporter;

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const user_email = process.env.SMTP_USER || "tktejas407@gmail.com";
const user_pass = process.env.SMTP_PASS || "ojvm ihsi vdwb rwsk";

// Check environment variables
console.log("SMTP CONFIG CHECK:", {
    SMTP_USER: user_email ? "Loaded" : "Missing",
    SMTP_PASS: user_pass ? "Loaded" : "Missing",
});

// if (!user_email || !user_pass) {
//     throw new Error("SMTP credentials are missing. Check your .env file.");
// }

// Gmail transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: user_email,
        pass: user_pass,
    },
});

// Verify Gmail connection
transporter.verify()
    .then(() => {
        console.log("Gmail Server Ready");
    })
    .catch((error) => {
        console.error("Gmail Connection Failed:", error.message);
    });

// Send email function
export const sendEmail = async ({ sendTo, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Avyadhik Corporation" <${user_email}>`,
            to: sendTo,
            subject,
            html,
        });

        console.log("Email sent successfully:", info.messageId);

        return info;

    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw error;
    }
};

export default transporter;
