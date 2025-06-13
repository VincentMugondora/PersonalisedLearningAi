import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS } from '../config/env';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Debug route to check users (remove in production)
router.get('/debug/users', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}, { 
      password: 0,  // Exclude password
      verificationCode: 0  // Exclude verification code
    }).lean(); // Use lean() to get plain JavaScript objects
    
    console.log('Debug: Found users:', users.length);
    users.forEach(user => {
      console.log('Debug: User:', {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        createdAt: (user as any).createdAt // Type assertion for timestamps
      });
    });

    res.json({ 
      count: users.length, 
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        createdAt: (user as any).createdAt // Type assertion for timestamps
      }))
    });
  } catch (error) {
    console.error('Debug: Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}));

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
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
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
router.post('/verify-email', asyncHandler(async (req: Request, res: Response) => {
  console.log('Verify email attempt:', { 
    email: req.body.email,
    code: req.body.code ? '***present***' : 'missing',
    body: req.body
  });

  const { email, code } = req.body;

  if (!email || !code) {
    console.log('Verification failed: Missing email or code');
    res.status(400).json({ 
      message: 'Email and verification code are required',
      received: { 
        email: email ? 'present' : 'missing',
        code: code ? 'present' : 'missing'
      }
    });
    return;
  }

  const user = await User.findOne({ email });
  console.log('User found:', user ? 'Yes' : 'No', user ? {
    isVerified: user.isVerified,
    hasVerificationCode: !!user.verificationCode
  } : '');

  if (!user) {
    console.log('Verification failed: User not found');
    res.status(400).json({ message: 'User not found' });
    return;
  }
  if (user.isVerified) {
    console.log('Verification failed: User already verified');
    res.status(400).json({ message: 'User already verified' });
    return;
  }

  console.log('Verifying code:', {
    provided: code,
    stored: user.verificationCode,
    match: user.verificationCode === code
  });

  if (user.verificationCode === code) {
    user.isVerified = true;
    user.verificationCode = undefined; // clear the code
    await user.save();
    console.log('Email verification successful');
    res.json({ message: 'Email verified successfully' });
  } else {
    console.log('Verification failed: Invalid code');
    res.status(400).json({ message: 'Invalid verification code' });
  }
}));

// Login route (only allow login if verified)
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  console.log('Login attempt:', { email: req.body.email });
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('Login failed: Missing email or password');
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ email });
  console.log('User found:', user ? 'Yes' : 'No', user ? `(verified: ${user.isVerified})` : '');

  if (!user) {
    console.log('Login failed: User not found');
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }
  
  if (!user.isVerified) {
    console.log('Login failed: User not verified');
    res.status(400).json({ message: 'Please verify your email before logging in' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch ? 'Yes' : 'No');

  if (!isMatch) {
    console.log('Login failed: Invalid password');
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  console.log('Login successful: Token generated');
  res.json({ token });
}));

// Resend verification code route
router.post('/resend-verification', asyncHandler(async (req: Request, res: Response) => {
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

// Get user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const user = await User.findById(req.user.id).select('-password -verificationCode');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
}));

export default router;
