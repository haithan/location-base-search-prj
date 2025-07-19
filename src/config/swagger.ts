import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Location-Based Service Search API',
    version: '1.0.0',
    description: 'A comprehensive API for location-based service search with user authentication and favorites management. Test data is centered around Hanoi, Vietnam (21.0285, 105.8542).',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}${config.apiPrefix}/${config.apiVersion}`,
      description: 'Development server - Test data centered around Hanoi, Vietnam',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'john_doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Service: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Central Hospital' },
          description: { type: 'string', example: 'Full-service medical facility' },
          latitude: { type: 'number', format: 'double', example: 21.0285 },
          longitude: { type: 'number', format: 'double', example: 105.8542 },
          address: { type: 'string', example: '123 Main St, New York, NY' },
          phone: { type: 'string', example: '+1-555-0123' },
          email: { type: 'string', format: 'email', example: 'info@hospital.com' },
          website: { type: 'string', format: 'uri', example: 'https://hospital.com' },
          rating: { type: 'number', format: 'float', example: 4.5 },
          service_type: { $ref: '#/components/schemas/ServiceType' },
          distance: { type: 'number', format: 'double', example: 2500.0000, description: 'Distance in meters (rounded to 4 decimal places)' },
          is_favorite: { type: 'boolean', example: false },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ServiceType: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Hospital' },
          description: { type: 'string', example: 'Medical facilities and hospitals' },
          icon: { type: 'string', example: 'hospital' },
        },
      },
      Country: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'United States' },
          code: { type: 'string', example: 'US' },
        },
      },
      AdministrativeDivision: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'New York' },
          type: { type: 'string', example: 'state' },
          parent_id: { type: 'integer', nullable: true, example: null },
          country_id: { type: 'integer', example: 1 },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          error: { type: 'string', example: 'Detailed error information' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              services: { type: 'array', items: {} },
              total: { type: 'integer', example: 100 },
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total_pages: { type: 'integer', example: 5 },
              has_next: { type: 'boolean', example: true },
              has_previous: { type: 'boolean', example: false },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Health',
      description: 'API health check endpoints',
    },
    {
      name: 'Authentication',
      description: 'User authentication and profile management',
    },
    {
      name: 'Services',
      description: 'Service search and management endpoints',
    },
    {
      name: 'Favorites',
      description: 'User favorites management',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
