"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.JWT_SECRET = exports.MONGODB_URI = exports.EMAIL_PASS = exports.EMAIL_USER = void 0;
exports.validateEnv = validateEnv;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.EMAIL_USER = process.env.EMAIL_USER || '';
exports.EMAIL_PASS = process.env.EMAIL_PASS || '';
exports.MONGODB_URI = process.env.MONGODB_URI || '';
exports.JWT_SECRET = process.env.JWT_SECRET || '';
exports.PORT = process.env.PORT || '5000';
function validateEnv() {
    if (!exports.EMAIL_USER)
        throw new Error('EMAIL_USER is not defined');
    if (!exports.EMAIL_PASS)
        throw new Error('EMAIL_PASS is not defined');
    if (!exports.MONGODB_URI)
        throw new Error('MONGODB_URI is not defined');
    if (!exports.JWT_SECRET)
        throw new Error('JWT_SECRET is not defined');
}
//# sourceMappingURL=env.js.map