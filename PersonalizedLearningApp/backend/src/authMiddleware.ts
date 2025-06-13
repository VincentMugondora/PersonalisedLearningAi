import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = verified;
    next();
    return;
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};
