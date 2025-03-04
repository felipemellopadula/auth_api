import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Define a custom interface for the decoded token
interface DecodedToken {
  userId: number;
  iat?: number;
  exp?: number;
}

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

export const authenticateToken = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token is required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    
    // Type assertion to ensure decoded matches DecodedToken
    req.user = decoded as DecodedToken;
    next();
  });
};