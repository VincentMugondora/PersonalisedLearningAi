import dotenv from 'dotenv';
import path from 'path';

// Load .env once
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Export variables
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';
export const MONGODB_URI = process.env.MONGODB_URI || '';
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const PORT = process.env.PORT || '5000';

// Optional: validate required env variables
export function validateEnv() {
  if (!EMAIL_USER) throw new Error('EMAIL_USER is not defined');
  if (!EMAIL_PASS) throw new Error('EMAIL_PASS is not defined');
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
}
