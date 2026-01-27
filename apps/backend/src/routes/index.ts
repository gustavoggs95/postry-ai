import { Router, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Protected route example
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
  });
});

export default router;
