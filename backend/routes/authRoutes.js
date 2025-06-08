// const express = require('express');
// const { register, login } = require('../controllers/authController');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const speakeasy = require('speakeasy'); // For generating OTPs
// const User = require('../models/User'); // User model
// require('dotenv').config();
// const { OAuth2Client } = require("google-auth-library"); // Ensure this works after installation

// const router = express.Router();
// const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID"); // Replace with your Google Client ID

// // Configure email transporter (Gmail)
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER, // Your email
//         pass: process.env.EMAIL_PASS, // Your Gmail app password
//     },
// });

// // Temporary OTP store (use Redis or database in production)
// const otpStore = {};

// // ➤ Route: User Registration
// router.post('/register', register);

// // ➤ Route: User Login
// router.post('/login', login);

// // ➤ Route: Google OAuth Login
// router.post('/google-login', async (req, res) => {
//     const { email, name } = req.body; // Google provides email and name

//     try {
//         let user = await User.findOne({ email });

//         if (!user) {
//             // If user doesn't exist, create one
//             user = new User({ email, name });
//             await user.save();
//         }

//         // Generate an OTP
//         const otp = speakeasy.totp({ secret: process.env.OTP_SECRET, digits: 6 });
//         otpStore[email] = otp;

//         // Send OTP via email
//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Verification Code',
//             text: `Your verification code is: ${otp}`,
//         });

//         res.json({ message: 'Code sent via email', email });
//     } catch (error) {
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ➤ Route: Verify OTP and Generate JWT
// router.post('/verify-otp', async (req, res) => {
//     const { email, otp } = req.body;

//     if (!otpStore[email] || otpStore[email] !== otp) {
//         return res.status(400).json({ error: 'Invalid or expired code' });
//     }

//     // Remove OTP after verification
//     delete otpStore[email];

//     // Generate a JWT token
//     const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.json({ message: 'Login successful', token });
// });

// // Google sign-in route
// router.post("/google", async (req, res) => {
//   const { tokenId } = req.body;

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: tokenId,
//       audience: "YOUR_GOOGLE_CLIENT_ID", // Replace with your Google Client ID
//     });
//     const { email, name, sub: googleId } = ticket.getPayload();

//     let user = await User.findOne({ email });
//     if (!user) {
//       // Create a new user if one doesn't exist
//       user = new User({
//         email,
//         name,
//         googleId,
//       });
//       await user.save();
//     }

//     // Generate a JWT token
//     const token = jwt.sign({ userId: user._id }, "YOUR_JWT_SECRET", { expiresIn: "1h" });

//     res.json({ token, userId: user._id });
//   } catch (error) {
//     console.error("Google sign-in error:", error);
//     res.status(500).json({ message: "Google sign-in failed." });
//   }
// });

// module.exports = router;
