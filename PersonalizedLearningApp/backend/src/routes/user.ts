import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS } from '../config/env';

const router = express.Router();

// Nodemailer transporter setup with debug enabled
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  debug: true,
  logger: true,
});

// Debug environment variables
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***present***' : 'undefined');

// Register route with email verification code sending
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: 'User already exists with this email' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const user = new User({
    name,
    email,
    password: hashedPassword,
    verificationCode,
    isVerified: false,
  });
  await user.save();

  // Email options
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Verify your email',
    text: `Your verification code is: ${verificationCode}`,
  };

  // Send verification email
  await transporter.sendMail(mailOptions);

  res.status(201).json({ message: 'User registered, verification code sent to email' });
}));

// Verify email route
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({ message: 'User not found' });
    return;
  }
  if (user.isVerified) {
    res.status(400).json({ message: 'User already verified' });
    return;
  }

  if (user.verificationCode === code) {
    user.isVerified = true;
    user.verificationCode = undefined; // clear the code
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid verification code' });
  }
}));

// Login route (only allow login if verified)
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }
  if (!user.isVerified) {
    res.status(400).json({ message: 'Please verify your email before logging in' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  res.json({ token });
}));

// Resend verification code route
router.post('/resend-verification', asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: 'User not found' });
    return;
  }
  if (user.isVerified) {
    res.status(400).json({ message: 'User already verified' });
    return;
  }

  // Generate a new 6-digit verification code
  const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = newVerificationCode;
  await user.save();

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Resend: Verify your email',
    text: `Your new verification code is: ${newVerificationCode}`,
  };

  await transporter.sendMail(mailOptions);

  res.json({ message: 'Verification code resent to your email' });
}));

export default router;
