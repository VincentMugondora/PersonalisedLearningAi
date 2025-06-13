"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/debug/users', (0, express_async_handler_1.default)(async (_req, res) => {
    try {
        const users = await User_1.default.find({}, {
            password: 0,
            verificationCode: 0
        }).lean();
        console.log('Debug: Found users:', users.length);
        users.forEach(user => {
            console.log('Debug: User:', {
                id: user._id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            });
        });
        res.json({
            count: users.length,
            users: users.map(user => ({
                id: user._id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }))
        });
    }
    catch (error) {
        console.error('Debug: Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: env_1.EMAIL_USER,
        pass: env_1.EMAIL_PASS,
    },
    debug: true,
    logger: true,
});
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***present***' : 'undefined');
router.post('/register', (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser) {
        res.status(400).json({ message: 'User already exists with this email' });
        return;
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User_1.default({
        name,
        email,
        password: hashedPassword,
        verificationCode,
        isVerified: false,
    });
    await user.save();
    const mailOptions = {
        from: env_1.EMAIL_USER,
        to: email,
        subject: 'Verify your email',
        text: `Your verification code is: ${verificationCode}`,
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'User registered, verification code sent to email' });
}));
router.post('/verify-email', (0, express_async_handler_1.default)(async (req, res) => {
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
    const user = await User_1.default.findOne({ email });
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
        user.verificationCode = undefined;
        await user.save();
        console.log('Email verification successful');
        res.json({ message: 'Email verified successfully' });
    }
    else {
        console.log('Verification failed: Invalid code');
        res.status(400).json({ message: 'Invalid verification code' });
    }
}));
router.post('/login', (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;
    if (!email || !password) {
        console.log('Login failed: Missing email or password');
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    const user = await User_1.default.findOne({ email });
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
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    if (!isMatch) {
        console.log('Login failed: Invalid password');
        res.status(400).json({ message: 'Invalid credentials' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful: Token generated');
    res.json({ token });
}));
router.post('/resend-verification', (0, express_async_handler_1.default)(async (req, res) => {
    const { email } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        res.status(400).json({ message: 'User not found' });
        return;
    }
    if (user.isVerified) {
        res.status(400).json({ message: 'User already verified' });
        return;
    }
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newVerificationCode;
    await user.save();
    const mailOptions = {
        from: env_1.EMAIL_USER,
        to: email,
        subject: 'Resend: Verify your email',
        text: `Your new verification code is: ${newVerificationCode}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Verification code resent to your email' });
}));
router.get('/profile', auth_1.authenticateToken, (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    const user = await User_1.default.findById(req.user.id).select('-password -verificationCode');
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
exports.default = router;
//# sourceMappingURL=user.js.map