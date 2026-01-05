import { type NextFunction, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as { email?: string; password?: string };

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.auth.jwtSecret,
        { expiresIn: '7d' },
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body as {
        email?: string;
        password?: string;
        name?: string;
        role?: string;
      };

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          name: name ?? null,
          role: role ?? 'supervisor',
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.auth.jwtSecret,
        { expiresIn: '7d' },
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };

      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Current password and new password are required' });
        return;
      }

      if (String(newPassword).length < 6) {
        res.status(400).json({ message: 'New password must be at least 6 characters' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        res.status(401).json({ message: 'Invalid current password' });
        return;
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token is required', data: null });
        return;
      }

      const decoded = jwt.verify(refreshToken, env.auth.jwtSecret) as any;
      const userId = String(decoded.id ?? decoded.userId ?? '');
      if (!userId) {
        res.status(401).json({ success: false, message: 'Invalid refresh token', data: null });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid refresh token', data: null });
        return;
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.auth.jwtSecret,
        { expiresIn: '7d' },
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken },
      });
    } catch {
      res.status(401).json({ success: false, message: 'Invalid refresh token', data: null });
    }
  }
}
