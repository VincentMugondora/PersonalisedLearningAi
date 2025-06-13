"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Authentication token required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const isAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=auth.js.map