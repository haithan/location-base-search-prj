import { ServiceSearchService } from '../../../src/services/ServiceSearchService';
import { ServiceModel } from '../../../src/models/Service';
import { FavoriteModel } from '../../../src/models/Favorite';

// Mock the models
jest.mock('../../../src/models/Service');
jest.mock('../../../src/models/Favorite');

describe('ServiceSearchService', () => {
  let serviceSearchService: ServiceSearchService;
  let mockServiceModel: jest.Mocked<ServiceModel>;
  let mockFavoriteModel: jest.Mocked<FavoriteModel>;

  beforeEach(() => {
    serviceSearchService = new ServiceSearchService();
    mockServiceModel = serviceSearchService['serviceModel'] as jest.Mocked<ServiceModel>;
    mockFavoriteModel = serviceSearchService['favoriteModel'] as jest.Mocked<FavoriteModel>;
  });

  describe('validateSearchParams', () => {
    it('should validate required latitude and longitude', () => {
      expect(() => {
        serviceSearchService.validateSearchParams({});
      }).toThrow('Latitude and longitude are required');

      expect(() => {
        serviceSearchService.validateSearchParams({ latitude: '10.5' });
      }).toThrow('Latitude and longitude are required');

      expect(() => {
        serviceSearchService.validateSearchParams({ longitude: '106.7' });
      }).toThrow('Latitude and longitude are required');
    });

    it('should validate latitude range', () => {
      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '91',
          longitude: '106.7'
        });
      }).toThrow('Invalid latitude');

      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '-91',
          longitude: '106.7'
        });
      }).toThrow('Invalid latitude');

      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: 'invalid',
          longitude: '106.7'
        });
      }).toThrow('Invalid latitude');
    });

    it('should validate longitude range', () => {
      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '10.5',
          longitude: '181'
        });
      }).toThrow('Invalid longitude');

      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '10.5',
          longitude: '-181'
        });
      }).toThrow('Invalid longitude');

      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '10.5',
          longitude: 'invalid'
        });
      }).toThrow('Invalid longitude');
    });

    it('should validate radius', () => {
      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '10.5',
          longitude: '106.7',
          radius: '0'
        });
      }).toThrow('Invalid radius');

      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '10.5',
          longitude: '106.7',
          radius: '101'
        });
      }).toThrow('Invalid radius');

      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '10.5',
          longitude: '106.7',
          radius: 'invalid'
        });
      }).toThrow('Invalid radius');
    });

    it('should validate limit and page', () => {
      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '10.5',
          longitude: '106.7',
          limit: '0'
        });
      }).toThrow('Invalid limit');

      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '10.5',
          longitude: '106.7',
          limit: '101'
        });
      }).toThrow('Invalid limit');

      expect(() => {
        serviceSearchService.validateSearchParams({
          latitude: '10.5',
          longitude: '106.7',
          page: '0'
        });
      }).toThrow('Invalid page');
    });

    it('should return valid search parameters with all filters', () => {
      const params = {
        latitude: '10.7769',
        longitude: '106.7009',
        radius: '5',
        service_type: '2',
        name: 'Test Restaurant',
        limit: '10',
        page: '2'
      };

      const result = serviceSearchService.validateSearchParams(params);

      expect(result).toEqual({
        latitude: 10.7769,
        longitude: 106.7009,
        radius: 5,
        service_type: 2,
        name: 'Test Restaurant',
        limit: 10,
        page: 2
      });
    });

    it('should use default values for optional parameters', () => {
      const params = {
        latitude: '10.7769',
        longitude: '106.7009'
      };

      const result = serviceSearchService.validateSearchParams(params);

      expect(result).toEqual({
        latitude: 10.7769,
        longitude: 106.7009,
        radius: 10,
        limit: 20,
        page: 1
      });
    });

    it('should handle partial parameters correctly', () => {
      const params = {
        latitude: '10.7769',
        longitude: '106.7009',
        name: 'Coffee Shop'
      };

      const result = serviceSearchService.validateSearchParams(params);

      expect(result).toEqual({
        latitude: 10.7769,
        longitude: 106.7009,
        radius: 10,
        name: 'Coffee Shop',
        limit: 20,
        page: 1
      });
    });
  });

  // Note: Full searchServices tests would require proper mocking of complex types
  // For now, focusing on parameter validation which is the core functionality
});
