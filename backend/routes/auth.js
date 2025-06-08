const express = require("express");
const router = express.Router();
const passport = require("passport");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const bcrypt = require("bcryptjs");
require("dotenv").config(); // Load environment variables
const { register, login } = require("../controllers/authController");
const { sendEmail } = require("../services/email.service");
const User = require("../models/User");

// Mock function to generate a 2FA code
const generate2FACode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Mock function to generate a reset code
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Mock database for storing 2FA codes temporarily
const twoFactorCodes = {};

// Store reset codes temporarily (in production, use Redis or similar)
const resetCodes = {};

// Configure nodemailer using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route to send 2FA code to the user's email
router.post("/send-2fa", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const code = generate2FACode();
    twoFactorCodes[email] = code; // Store the code temporarily

    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code for Finova",
      text: `Hello,
    
    Your account verification code is: ${code}
    
    This code will expire in 10 minutes.
    
    If you didn't request this code, please ignore this message or contact our support team at ${process.env.SUPPORT_EMAIL}.
    
    Thank you,
    The ${process.env.COMPANY_NAME} Security Team`,
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4a4a4a;">Account Verification</h2>
      </div>
      <div style="background-color: #f9f9f9; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
        <p>Hello,</p>
        <p>You recently requested a verification code to secure your account. Please use the code below:</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; border: 1px solid #e0e0e0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</span>
        </div>
        <p><strong>This code will expire in 10 minutes.</strong></p>
        <p>If you didn't request this code, please ignore this message or contact our support team.</p>
      </div>
      <div style="font-size: 12px; color: #777777; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eeeeee;">
        <p>This is an automated message, please do not reply directly to this email.</p>
        <p>© ${new Date().getFullYear()}  • </p>
      </div>
    </body>
    </html>
      `,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'X-Mailer': 'Custom Mailer',
        'List-Unsubscribe': `<mailto:unsubscribe@${process.env.DOMAIN}?subject=unsubscribe>, <${process.env.UNSUBSCRIBE_URL}>`,
        'Feedback-ID': `2fa:${process.env.EMAIL_ID}`
      }
    });

    console.log("Security verification code sent to:", email);

    res.status(200).json({ message: "2FA code sent to email" });
  } catch (error) {
    console.error("Error sending 2FA code:", error);
    res.status(500).json({ error: "Failed to send 2FA code" });
  }
});

// Route to verify the 2FA code
router.post("/verify-2fa", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  if (twoFactorCodes[email] === code) {
    delete twoFactorCodes[email]; // Remove the code after successful verification

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("2FA verification successful for user:", email);
    res.status(200).json({ message: "2FA verification successful", token });
  } else {
    console.log("Invalid or expired 2FA code for user:", email);
    res.status(400).json({ error: "Invalid or expired 2FA code" });
  }
});

// Route to send verification email
router.post("/send-verification", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  console.log(`Sending verification email to ${email}`);
  // Simulate email sending
  setTimeout(() => {
    res.status(200).json({ message: "Verification email sent successfully" });
  }, 1000);
});

// Route to handle forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset code
    const code = generateResetCode();
    resetCodes[email] = {
      code,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    // Send email with reset code
    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this message.`,
    });

    res.status(200).json({ message: "Reset code sent successfully" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Failed to send reset code" });
  }
});

// Route to handle password reset
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if reset code exists and is valid
    const resetData = resetCodes[email];
    if (!resetData || resetData.code !== code || Date.now() > resetData.expires) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Remove used reset code
    delete resetCodes[email];

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Delegate login and register routes to controller functions
router.post("/register", register);
router.post("/login", login);

// Route to initiate Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Route to handle Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const token = jwt.sign({ userId: req.user._id, email: req.user.email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).json({ message: "Google login successful", token, user: req.user });
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
