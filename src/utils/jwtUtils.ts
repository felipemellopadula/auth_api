// jwtUtils.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// No need for a separate interface 
// This augments the existing Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any; // or a more specific type like { userId: number }
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

export const authenticateToken = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token is required' });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    
    // Attach the decoded token to the request object
    req.user = decoded;
    next();
  });
};