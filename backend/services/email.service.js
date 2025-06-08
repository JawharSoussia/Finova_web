const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env

// Create the transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use Gmail service
  auth: {
    user: process.env.EMAIL_USER, // Email user from .env
    pass: process.env.EMAIL_PASS, // Email password (or app password) from .env
  },
});

// Generic function to send an email
const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"Finova" <${process.env.EMAIL_USER}>`, // Sender email from .env
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };
