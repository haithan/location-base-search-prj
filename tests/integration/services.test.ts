import request from 'supertest';
import App from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { getAuthHeaders } from '../helpers/auth';

describe('Services Integration Tests', () => {
  let app: App;
  let server: any;

  beforeAll(async () => {
    app = new App();
    server = app.app;

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { seedDatabase } = await import('../../src/database/seed');
    await seedDatabase();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
      await AppDataSource.query('TRUNCATE TABLE services');
      await AppDataSource.query('TRUNCATE TABLE service_types');
      await AppDataSource.query('TRUNCATE TABLE administrative_divisions');
      await AppDataSource.query('TRUNCATE TABLE users');
      await AppDataSource.query('TRUNCATE TABLE user_favorites');
      await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  });

  describe('GET /api/v1/services/search', () => {
    it('should search services by location', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')
        .set(getAuthHeaders())
        .query({
          latitude: 40.7681,
          longitude: -73.9819,
          radius: 10,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toBeDefined();
      expect(Array.isArray(response.body.data.services)).toBe(true);
      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
    });

    it('should search services with service type filter', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')
        .set(getAuthHeaders())
        .query({
          latitude: 40.7681,
          longitude: -73.9819,
          radius: 10,
          service_type: 1, // Supermarket ID
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.services.forEach((service: any) => {
        expect(service.service_type_name).toBe('Supermarket');
      });
    });

    it('should search services with name filter', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')
        .set(getAuthHeaders())
        .query({
          latitude: 40.7681,
          longitude: -73.9819,
          radius: 10,
          name: 'Whole Foods',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.services.length > 0) {
        response.body.data.services.forEach((service: any) => {
          expect(service.name.toLowerCase()).toContain('whole foods');
        });
      }
    });

    it('should return validation error for missing coordinates', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')
        .set(getAuthHeaders())
        .query({
          radius: 10,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Latitude and longitude are required');
    });

    it('should return validation error for invalid coordinates', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')
        .set(getAuthHeaders())
        .query({
          latitude: 91, // Invalid latitude
          longitude: -73.9819,
          radius: 10,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid latitude');
    });

    // Mixed search parameter tests
    describe('Mixed search parameters', () => {
      it('should search with lat, long, radius, and name', async () => {
        const response = await request(server)
          .get('/api/v1/services/search')
          .set(getAuthHeaders())
          .query({
            latitude: 10.7769,
            longitude: 106.7009,
            radius: 5,
            name: 'Group',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.services).toBeDefined();
        expect(Array.isArray(response.body.data.services)).toBe(true);
        expect(response.body.data.total).toBeDefined();
        expect(response.body.data.page).toBe(1);
        expect(response.body.data.limit).toBe(20);

        // If services found, verify they contain the name filter
        if (response.body.data.services.length > 0) {
          response.body.data.services.forEach((service: any) => {
            expect(service.name.toLowerCase()).toContain('group');
          });
        }
      });

      it('should search with lat, long, radius, and service_type', async () => {
        const response = await request(server)
          .get('/api/v1/services/search')
          .set(getAuthHeaders())
          .query({
            latitude: 10.7769,
            longitude: 106.7009,
            radius: 10,
            service_type: 3, // Restaurant ID
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.services).toBeDefined();
        expect(Array.isArray(response.body.data.services)).toBe(true);

        // If services found, verify they are of the correct type
        if (response.body.data.services.length > 0) {
          response.body.data.services.forEach((service: any) => {
            expect(service.service_type_name).toBe('Restaurant');
          });
        }
      });

      it('should search with lat, long, radius, name, and service_type', async () => {
        const response = await request(server)
          .get('/api/v1/services/search')
          .set(getAuthHeaders())
          .query({
            latitude: 34.0522,
            longitude: -118.2437,
            radius: 15,
            name: 'Inc',
            service_type: 5, // Bank ID
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.services).toBeDefined();
        expect(Array.isArray(response.body.data.services)).toBe(true);

        // If services found, verify they match both filters
        if (response.body.data.services.length > 0) {
          response.body.data.services.forEach((service: any) => {
            expect(service.name.toLowerCase()).toContain('inc');
            expect(service.service_type_name).toBe('Bank');
          });
        }
      });

      it('should search with all parameters including pagination', async () => {
        const response = await request(server)
          .get('/api/v1/services/search')

          .set(getAuthHeaders())
          .query({
            latitude: 51.5074,
            longitude: -0.1278,
            radius: 20,
            name: 'Group',
            service_type: 6, // Hospital ID
            limit: 5,
            page: 1,
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.services).toBeDefined();
        expect(Array.isArray(response.body.data.services)).toBe(true);
        expect(response.body.data.limit).toBe(5);
        expect(response.body.data.page).toBe(1);

        // Verify pagination limit is respected
        expect(response.body.data.services.length).toBeLessThanOrEqual(5);

        // If services found, verify they match all filters
        if (response.body.data.services.length > 0) {
          response.body.data.services.forEach((service: any) => {
            expect(service.name.toLowerCase()).toContain('group');
            expect(service.service_type_name).toBe('Hospital');
          });
        }
      });

      it('should handle search with no results', async () => {
        const response = await request(server)
          .get('/api/v1/services/search')

          .set(getAuthHeaders())
          .query({
            latitude: 0,
            longitude: 0,
            radius: 1,
            name: 'NonExistentService12345',
            service_type: 1, // Supermarket ID
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.services).toBeDefined();
        expect(Array.isArray(response.body.data.services)).toBe(true);
        expect(response.body.data.services.length).toBe(0);
        expect(response.body.data.total).toBe(0);
      });

      it('should validate invalid service_type', async () => {
        const response = await request(server)
          .get('/api/v1/services/search')

          .set(getAuthHeaders())
          .query({
            latitude: 10.7769,
            longitude: 106.7009,
            radius: 5,
            service_type: 'invalid', // Invalid string should cause validation error
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Invalid service type');
      });

      it('should handle large radius values', async () => {
        const response = await request(server)
          .get('/api/v1/services/search')

          .set(getAuthHeaders())
          .query({
            latitude: 35.6762,
            longitude: 139.6503,
            radius: 50,
            name: 'Group',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.services).toBeDefined();
        expect(Array.isArray(response.body.data.services)).toBe(true);
      });

      it('should handle case-insensitive name search', async () => {
        const response = await request(server)
          .get('/api/v1/services/search')

          .set(getAuthHeaders())
          .query({
            latitude: 10.7769,
            longitude: 106.7009,
            radius: 10,
            name: 'GROUP', // Uppercase
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.services).toBeDefined();
        expect(Array.isArray(response.body.data.services)).toBe(true);

        // If services found, verify case-insensitive search works
        if (response.body.data.services.length > 0) {
          response.body.data.services.forEach((service: any) => {
            expect(service.name.toLowerCase()).toContain('group');
          });
        }
      });
    });
  });

  describe('GET /api/v1/services/types', () => {
    it('should return all service types', async () => {
      const response = await request(server)
        .get('/api/v1/services/types')

        .set(getAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check structure of service type
      const serviceType = response.body.data[0];
      expect(serviceType).toHaveProperty('id');
      expect(serviceType).toHaveProperty('name');
      expect(serviceType).toHaveProperty('description');
      expect(serviceType).toHaveProperty('icon');
    });
  });

  describe('GET /api/v1/services/popular', () => {
    it('should return popular services', async () => {
      const response = await request(server)
        .get('/api/v1/services/popular')

        .set(getAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(server)
        .get('/api/v1/services/popular')

        .set(getAuthHeaders())
        .query({ limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/v1/services/:serviceId', () => {
    it('should return service details by ID', async () => {
      // First, get a service ID from search
      const searchResponse = await request(server)
        .get('/api/v1/services/search')

        .set(getAuthHeaders())
        .query({
          latitude: 40.7681,
          longitude: -73.9819,
          radius: 10,
        });

      if (searchResponse.body.data.services.length > 0) {
        const serviceId = searchResponse.body.data.services[0].id;

        const response = await request(server)
          .get(`/api/v1/services/${serviceId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(serviceId);
        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('service_type_name');
        expect(response.body.data).toHaveProperty('address');
        expect(response.body.data).toHaveProperty('latitude');
        expect(response.body.data).toHaveProperty('longitude');
      }
    });

    it('should return 404 for non-existent service', async () => {
      const response = await request(server)
        .get('/api/v1/services/99999')

        .set(getAuthHeaders())
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Service not found');
    });

    it('should return validation error for invalid service ID', async () => {
      const response = await request(server)
        .get('/api/v1/services/invalid')

        .set(getAuthHeaders())
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid service ID');
    });
  });
});
