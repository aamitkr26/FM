import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { env } from '../../config/env';

export class AuthController {
  /**
   * Login user (POST /api/auth/login)
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          data: null
        });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          data: null
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          data: null
        });
      }

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          companyId: (user as any).companyId
        },
        env.auth.jwtSecret,
        { expiresIn: env.auth.jwtExpiresIn } as SignOptions
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        env.auth.jwtRefreshSecret,
        { expiresIn: env.auth.jwtRefreshExpiresIn } as SignOptions
      );

      // Return user data with tokens
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: (user as any).companyId
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Refresh token (POST /api/auth/refresh)
   */
  async refresh(req: Request, res: Response, _next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          data: null
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.auth.jwtRefreshSecret) as any;
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          data: null
        });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          companyId: (user as any).companyId
        },
        env.auth.jwtSecret,
        { expiresIn: env.auth.jwtExpiresIn } as SignOptions
      );

      return res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        data: null
      });
    }
  }
}
