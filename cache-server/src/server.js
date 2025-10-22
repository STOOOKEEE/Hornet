import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import logger from './utils/logger.js';
import redisService from './services/redis.service.js';
import scheduler from './scheduler.js';
import apiRoutes from './routes/api.routes.js';
import {
  rateLimiter,
  requestLogger,
  errorHandler,
  notFoundHandler,
  corsOptions,
  compressionMiddleware,
  securityMiddleware,
} from './middleware/index.js';

class Server {
  constructor() {
    this.app = express();
    this.server = null;
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security
    this.app.use(securityMiddleware);

    // CORS
    this.app.use(cors(corsOptions));

    // Compression
    this.app.use(compressionMiddleware);

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Rate limiting
    this.app.use('/api/', rateLimiter);
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Hornet Cache Server',
        version: '1.0.0',
        endpoints: {
          analysis: '/api/analysis',
          pools: '/api/pools',
          metadata: '/api/metadata',
          health: '/api/health',
          stats: '/api/stats',
          refresh: 'POST /api/refresh',
          clearCache: 'DELETE /api/cache',
        },
      });
    });

    // API routes
    this.app.use('/api', apiRoutes);

    // 404 handler
    this.app.use(notFoundHandler);

    // Error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  async start() {
    try {
      logger.info('🚀 Starting Hornet Cache Server...');

      // Connect to Redis
      logger.info('Connecting to Redis...');
      await redisService.connect();

      // Setup middleware and routes
      this.setupMiddleware();
      this.setupRoutes();

      // Start HTTP server
      this.server = this.app.listen(config.port, config.host, () => {
        logger.info(`✅ Server running on http://${config.host}:${config.port}`);
        logger.info(`📊 Environment: ${config.env}`);
        logger.info(`🔄 Cache refresh interval: ${config.cache.refreshIntervalMinutes} minutes`);
      });

      // Start scheduler
      scheduler.start();

      // Graceful shutdown
      this.setupGracefulShutdown();

      logger.info('🎉 Server started successfully!');
    } catch (error) {
      logger.error('Failed to start server', { error: error.message });
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      // Stop accepting new connections
      if (this.server) {
        this.server.close(() => {
          logger.info('HTTP server closed');
        });
      }

      // Stop scheduler
      scheduler.stop();

      // Disconnect from Redis
      await redisService.disconnect();

      logger.info('Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      shutdown('UNHANDLED_REJECTION');
    });
  }
}

// Start server
const server = new Server();
server.start();

export default server;
