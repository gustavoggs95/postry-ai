import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
}

export function errorHandler(err: ApiError, req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
