import { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.header('authorization');
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = header.slice('bearer '.length).trim();
  try {
    const decoded = jwt.verify(token, env.auth.jwtSecret) as any;
    const user: AuthUser = {
      id: String(decoded.id ?? decoded.userId ?? ''),
      email: String(decoded.email ?? ''),
      role: String(decoded.role ?? ''),
    };

    if (!user.id || !user.email) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const authorize = (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (!role) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (!roles.includes(role)) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  next();
};
