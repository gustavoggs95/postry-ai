import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    [key: string]: unknown;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      ...user.user_metadata,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}
