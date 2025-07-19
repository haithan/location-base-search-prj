import request from 'supertest';
import App from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { getAuthHeaders } from '../helpers/auth';

describe('Mixed Search Parameters Integration Tests', () => {
  let appInstance: App;
  let server: any;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    appInstance = new App();
    server = appInstance.app;
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Location-based search with mixed parameters', () => {
    it('should search with lat, long, radius, and name', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')

        .set(getAuthHeaders())
        .query({
          latitude: 0,
          longitude: 0,
          radius: 50,
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
          latitude: 0,
          longitude: 0,
          radius: 50,
          service_type: 6, // Hospital ID
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toBeDefined();
      expect(Array.isArray(response.body.data.services)).toBe(true);

      if (response.body.data.services.length > 0) {
        response.body.data.services.forEach((service: any) => {
          expect(service.service_type_name).toBe('Hospital');
        });
      }
    });

    it('should search with lat, long, radius, name, and service_type', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')

        .set(getAuthHeaders())
        .query({
          latitude: 0,
          longitude: 0,
          radius: 50,
          name: 'Group',
          service_type: 6, // Hospital ID
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toBeDefined();
      expect(Array.isArray(response.body.data.services)).toBe(true);

      if (response.body.data.services.length > 0) {
        response.body.data.services.forEach((service: any) => {
          expect(service.name.toLowerCase()).toContain('group');
          expect(service.service_type_name).toBe('Hospital');
        });
      }
    });

    it('should search with all parameters including pagination', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')

        .set(getAuthHeaders())
        .query({
          latitude: 0,
          longitude: 0,
          radius: 50,
          name: 'Group',
          service_type: 6, // Hospital ID
          limit: 2,
          page: 1,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toBeDefined();
      expect(Array.isArray(response.body.data.services)).toBe(true);

      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.services.length).toBeLessThanOrEqual(2);

      if (response.body.data.services.length > 0) {
        response.body.data.services.forEach((service: any) => {
          expect(service.name.toLowerCase()).toContain('group');
          expect(service.service_type_name).toBe('Hospital');
        });
      }
    });

    it('should handle case-insensitive name search', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')

        .set(getAuthHeaders())
        .query({
          latitude: 0,
          longitude: 0,
          radius: 50,
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

    it('should handle invalid service_type gracefully', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')

        .set(getAuthHeaders())
        .query({
          latitude: 0,
          longitude: 0,
          radius: 50,
          service_type: 'invalid', // Invalid string should cause validation error
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid service type');
    });

    it('should validate required parameters', async () => {
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

    it('should validate coordinate ranges', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')

        .set(getAuthHeaders())
        .query({
          latitude: 91, // Invalid latitude
          longitude: 0,
          radius: 10,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid latitude');
    });

    it('should validate radius limits', async () => {
      const response = await request(server)
        .get('/api/v1/services/search')

        .set(getAuthHeaders())
        .query({
          latitude: 0,
          longitude: 0,
          radius: 100, // Invalid radius (too large)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid radius');
    });
  });
});
