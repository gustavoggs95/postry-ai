import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import indexRoutes from './routes/index.js';
import brandRoutes from './routes/brands.js';
import contentRoutes from './routes/content.js';
import assetRoutes from './routes/assets.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (!config.isProduction) {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1', indexRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/assets', assetRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`
Postry AI Backend Server (${config.nodeEnv})
Port: ${config.port}
API URL: http://localhost:${config.port}/api/v1`);
});

export default app;
