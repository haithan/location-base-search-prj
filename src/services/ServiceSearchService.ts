import { ServiceModel } from '../models/Service';
import { FavoriteModel } from '../models/Favorite';
import { SearchServicesRequest, SearchServicesResponse, ServiceWithType, ServiceType } from '../types';

export class ServiceSearchService {
  private serviceModel: ServiceModel;
  private favoriteModel: FavoriteModel;

  constructor() {
    this.serviceModel = new ServiceModel();
    this.favoriteModel = new FavoriteModel();
  }

  async searchServices(searchParams: SearchServicesRequest, userId?: number): Promise<SearchServicesResponse> {
    const limit = searchParams.limit || 20;
    const page = searchParams.page || 1;
    const offset = (page - 1) * limit;

    const paginatedParams = {
      ...searchParams,
      limit,
      page
    };
    const { services, total } = await this.serviceModel.searchServices(paginatedParams);

    if (userId) {
      await this.addFavoriteStatusToServices(services, userId);
    }

    const totalPages = Math.ceil(total / limit);

    return {
      services,
      total,
      page,
      limit,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_previous: page > 1,
    };
  }

  async getServiceById(serviceId: number, userId?: number): Promise<ServiceWithType & { is_favorite?: boolean; favorite_count: number }> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const serviceRepository = new (await import('../repositories/ServiceRepository')).ServiceRepository();
    const [serviceWithType] = await serviceRepository.transformToServiceWithType([service]);

    const favoriteStats = await this.favoriteModel.getFavoriteStats(serviceId);
    const serviceWithStats = {
      ...serviceWithType,
      favorite_count: favoriteStats.count,
    };

    if (userId) {
      const isFavorite = await this.favoriteModel.isFavorite(userId, serviceId);
      (serviceWithStats as any).is_favorite = isFavorite;
    }

    return serviceWithStats;
  }

  async getAllServiceTypes(): Promise<ServiceType[]> {
    const serviceTypes = await this.serviceModel.getAllServiceTypes();
    return serviceTypes.map(st => ({
      ...st,
      description: st.description || undefined,
      icon: st.icon || undefined
    }));
  }

  async getServicesByType(serviceTypeId: number, limit: number = 20, page: number = 1, userId?: number): Promise<ServiceWithType[]> {
    const services = await this.serviceModel.getServicesByType(serviceTypeId, limit, page);

    if (userId) {
      await this.addFavoriteStatusToServices(services, userId);
    }

    return services;
  }

  async getPopularServices(limit: number = 10, userId?: number): Promise<ServiceWithType[]> {
    const services = await this.serviceModel.getPopularServices(limit);

    if (userId) {
      await this.addFavoriteStatusToServices(services, userId);
    }

    return services;
  }

  async getAllCountries(): Promise<any[]> {
    return await this.serviceModel.getAllCountries();
  }

  async getAdministrativeDivisions(countryCode: string, parentId?: number): Promise<any[]> {
    return await this.serviceModel.getAdministrativeDivisions(countryCode, parentId);
  }

  async searchByAddress(searchTerm: string, limit: number = 20, userId?: number): Promise<ServiceWithType[]> {
    const services = await this.serviceModel.searchByAddress(searchTerm, limit);

    if (userId) {
      await this.addFavoriteStatusToServices(services, userId);
    }

    return services;
  }

  private async addFavoriteStatusToServices(services: ServiceWithType[], userId: number): Promise<void> {
    for (const service of services) {
      const isFavorite = await this.favoriteModel.isFavorite(userId, service.id);
      (service as any).is_favorite = isFavorite;
    }
  }

  validateSearchParams(params: any): SearchServicesRequest {
    const { latitude, longitude, radius, service_type, name, limit, page } = params;

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error('Invalid latitude. Must be between -90 and 90');
    }

    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      throw new Error('Invalid longitude. Must be between -180 and 180');
    }

    let radiusValue = 10;
    if (radius) {
      radiusValue = parseFloat(radius);
      if (isNaN(radiusValue) || radiusValue <= 0 || radiusValue > 50) {
        throw new Error('Invalid radius. Must be between 0 and 50 kilometers');
      }
    }

    let limitValue = 20;
    if (limit) {
      limitValue = parseInt(limit);
      if (isNaN(limitValue) || limitValue <= 0 || limitValue > 100) {
        throw new Error('Invalid limit. Must be between 1 and 100');
      }
    }

    let pageValue = 1;
    if (page) {
      pageValue = parseInt(page);
      if (isNaN(pageValue) || pageValue < 1) {
        throw new Error('Invalid page. Must be a positive integer');
      }
    }

    let serviceTypeValue: number | undefined;
    if (service_type) {
      serviceTypeValue = parseInt(service_type);
      if (isNaN(serviceTypeValue) || serviceTypeValue <= 0) {
        throw new Error('Invalid service type. Must be a positive integer');
      }
    }

    return {
      latitude: lat,
      longitude: lng,
      radius: radiusValue,
      service_type: serviceTypeValue,
      name: name as string,
      limit: limitValue,
      page: pageValue,
    };
  }
}
