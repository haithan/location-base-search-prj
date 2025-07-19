import { ServiceModel } from '../../../src/models/Service';
import { ServiceRepository } from '../../../src/repositories/ServiceRepository';
import { AppDataSource } from '../../../src/config/database';

// Mock the AppDataSource and repositories
jest.mock('../../../src/config/database');
jest.mock('../../../src/repositories/ServiceRepository');

describe('ServiceModel', () => {
  let serviceModel: ServiceModel;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;
  let mockTypeOrmRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockServiceRepository = {
      findById: jest.fn(),
      searchServices: jest.fn(),
      findByServiceType: jest.fn(),
      transformToServiceWithType: jest.fn(),
    } as any;

    mockTypeOrmRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    (ServiceRepository as jest.MockedClass<typeof ServiceRepository>).mockImplementation(() => mockServiceRepository);

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeOrmRepository);

    serviceModel = new ServiceModel();
  });

  describe('findById', () => {
    it('should find service by id with type information', async () => {
      const mockService = {
        id: 1,
        name: 'Test Store',
        serviceTypeId: 1,
        streetAddress: '123 Test St',
        latitude: 40.7128,
        longitude: -74.0060,
        phone: '555-1234',
        website: 'https://test.com',
        rating: 4.5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        countryCode: 'US',
        addressComponents: {},
        serviceType: {
          id: 1,
          name: 'Supermarket',
          icon: 'shopping-cart'
        }
      };

      mockServiceRepository.findById.mockResolvedValue(mockService as any);

      const result = await serviceModel.findById(1);

      expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockService);
    });

    it('should return null if service not found', async () => {
      mockServiceRepository.findById.mockResolvedValue(null);

      const result = await serviceModel.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('searchServices', () => {
    it('should search services with location and filters', async () => {
      const searchParams = {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 5,
        service_type: 1,
        name: 'Test',
        limit: 10,
        page: 1,
      };

      const mockServices = [
        {
          id: 1,
          name: 'Test Store',
          service_type_id: 1,
          street_address: '123 Test St',
          address_components: {},
          country_id: 'US',
          latitude: 40.7128,
          longitude: -74.0060,
          phone: '555-1234',
          website: 'https://test.com',
          rating: 4.5,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          service_type_name: 'Supermarket',
          service_type_icon: 'shopping-cart',
          country_name: 'United States',
          country_code: 'US',
          formatted_address: '123 Test St',
          address_display: { street: '123 Test St', country: 'United States' },
          distance: 2.5,
        },
      ];

      const mockResult = { services: mockServices, total: 1 };
      mockServiceRepository.searchServices.mockResolvedValue(mockResult);

      const result = await serviceModel.searchServices(searchParams);

      expect(mockServiceRepository.searchServices).toHaveBeenCalledWith(searchParams);
      expect(result).toEqual(mockResult);
    });

    it('should search services without filters', async () => {
      const searchParams = {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 10,
        limit: 20,
        page: 1,
      };

      const mockServices = [
        {
          id: 1,
          name: 'Store 1',
          service_type_id: 1,
          street_address: '123 Main St',
          address_components: {},
          country_id: 'US',
          latitude: 40.7128,
          longitude: -74.0060,
          rating: 4.0,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          service_type_name: 'Supermarket',
          country_name: 'United States',
          country_code: 'US',
          formatted_address: '123 Main St',
          address_display: { street: '123 Main St', country: 'United States' },
          distance: 1.2,
        },
        {
          id: 2,
          name: 'Store 2',
          service_type_id: 2,
          street_address: '456 Oak Ave',
          address_components: {},
          country_id: 'US',
          latitude: 40.7200,
          longitude: -74.0100,
          rating: 4.5,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          service_type_name: 'Restaurant',
          country_name: 'United States',
          country_code: 'US',
          formatted_address: '456 Oak Ave',
          address_display: { street: '456 Oak Ave', country: 'United States' },
          distance: 3.4,
        },
      ];

      const mockResult = { services: mockServices, total: 2 };
      mockServiceRepository.searchServices.mockResolvedValue(mockResult);

      const result = await serviceModel.searchServices(searchParams);

      expect(mockServiceRepository.searchServices).toHaveBeenCalledWith(searchParams);
      expect(result.services).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('getAllServiceTypes', () => {
    it('should return all service types', async () => {
      const mockServiceTypes = [
        { id: 1, name: 'Supermarket', description: 'Grocery stores', icon: 'shopping-cart' },
        { id: 2, name: 'Restaurant', description: 'Dining establishments', icon: 'utensils' },
      ];

      mockTypeOrmRepository.find.mockResolvedValue(mockServiceTypes);

      const result = await serviceModel.getAllServiceTypes();

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
      expect(result).toEqual(mockServiceTypes);
    });
  });

  describe('getServicesByType', () => {
    it('should return services filtered by type', async () => {
      const mockServices = [
        {
          id: 1,
          name: 'Store 1',
          serviceTypeId: 1,
          streetAddress: '123 Main St',
          rating: 4.5,
          isActive: true,
        },
        {
          id: 2,
          name: 'Store 2',
          serviceTypeId: 1,
          streetAddress: '456 Oak Ave',
          rating: 4.2,
          isActive: true,
        },
      ];

      const mockTransformedServices = [
        {
          id: 1,
          name: 'Store 1',
          service_type_name: 'Supermarket',
          rating: 4.5,
        },
        {
          id: 2,
          name: 'Store 2',
          service_type_name: 'Supermarket',
          rating: 4.2,
        },
      ];

      mockServiceRepository.findByServiceType.mockResolvedValue(mockServices as any);
      mockServiceRepository.transformToServiceWithType.mockResolvedValue(mockTransformedServices as any);

      const result = await serviceModel.getServicesByType(1, 10, 0);

      expect(mockServiceRepository.findByServiceType).toHaveBeenCalledWith(1);
      expect(mockServiceRepository.transformToServiceWithType).toHaveBeenCalled();
      expect(result).toEqual(mockTransformedServices);
    });
  });

  describe('getPopularServices', () => {
    it('should return popular services ordered by rating', async () => {
      const mockServices = [
        {
          id: 1,
          name: 'Popular Store',
          serviceTypeId: 1,
          rating: 4.8,
          isActive: true,
          serviceType: { id: 1, name: 'Supermarket' },
        },
      ];

      const mockTransformedServices = [
        {
          id: 1,
          name: 'Popular Store',
          service_type_name: 'Supermarket',
          rating: 4.8,
        },
      ];

      mockTypeOrmRepository.find.mockResolvedValue(mockServices);
      mockServiceRepository.transformToServiceWithType.mockResolvedValue(mockTransformedServices as any);

      const result = await serviceModel.getPopularServices(5);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['serviceType'],
        order: { rating: 'DESC', createdAt: 'DESC' },
        take: 5
      });
      expect(mockServiceRepository.transformToServiceWithType).toHaveBeenCalledWith(mockServices);
      expect(result).toEqual(mockTransformedServices);
    });
  });
});
