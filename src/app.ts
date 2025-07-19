import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initializeDatabase, closeDatabase } from './config/database';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());

    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
    }));

    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Location-Based Service Search API Documentation',
    }));

    this.app.use(`${config.apiPrefix}/${config.apiVersion}`, routes);

    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Welcome to Location-Based Service Search API',
        version: config.apiVersion,
        documentation: `${req.protocol}://${req.get('host')}/api-docs`,
        health_check: `${req.protocol}://${req.get('host')}${config.apiPrefix}/${config.apiVersion}/health`,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);

    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await initializeDatabase();

      this.app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
        console.log(`Environment: ${config.nodeEnv}`);
        console.log(`API Base URL: http://localhost:${config.port}${config.apiPrefix}/${config.apiVersion}`);
        console.log(`Health Check: http://localhost:${config.port}${config.apiPrefix}/${config.apiVersion}/health`);
        console.log(`API Documentation: http://localhost:${config.port}/api-docs`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await closeDatabase();
      console.log('Server stopped gracefully');
    } catch (error) {
      console.error('Error stopping server:', error);
    }
  }
}

export default App;
