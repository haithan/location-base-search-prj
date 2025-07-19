import { ServiceRepository } from '../repositories/ServiceRepository';
import { Service as ServiceEntity } from '../entities/Service';
import { ServiceType as ServiceTypeEntity } from '../entities/ServiceType';
import { ServiceWithType, SearchServicesRequest, PaginationParams } from '../types';
import { AddressService } from '../services/AddressService';
import { AppDataSource } from '../config/database';

export class ServiceModel {
  private serviceRepository: ServiceRepository;
  private addressService: AddressService;

  constructor() {
    this.serviceRepository = new ServiceRepository();
    this.addressService = new AddressService();
  }

  async findById(id: number): Promise<ServiceEntity | null> {
    return await this.serviceRepository.findById(id);
  }

  async searchServices(params: SearchServicesRequest & PaginationParams): Promise<{ services: ServiceWithType[], total: number }> {
    return await this.serviceRepository.searchServices(params);
  }

  async getAllServiceTypes(): Promise<ServiceTypeEntity[]> {
    const repository = AppDataSource.getRepository(ServiceTypeEntity);
    return await repository.find({ order: { name: 'ASC' } });
  }

  async getServicesByType(serviceTypeId: number, limit: number = 20, page: number = 1): Promise<ServiceWithType[]> {
    const services = await this.serviceRepository.findByServiceType(serviceTypeId);
    const offset = (page - 1) * limit;
    const paginatedServices = services.slice(offset, offset + limit);
    return await this.serviceRepository.transformToServiceWithType(paginatedServices);
  }

  async getServicesByCountry(countryCode: string): Promise<ServiceEntity[]> {
    return await this.serviceRepository.findByCountry(countryCode);
  }

  async getPopularServices(limit: number = 10): Promise<ServiceWithType[]> {
    const repository = AppDataSource.getRepository(ServiceEntity);
    const services = await repository.find({
      where: { isActive: true },
      relations: ['serviceType'],
      order: { rating: 'DESC', createdAt: 'DESC' },
      take: limit
    });
    return await this.serviceRepository.transformToServiceWithType(services);
  }

  async getAllCountries(): Promise<{ code: string; name: string; address_format: any }[]> {
    return this.addressService.getCountries();
  }

  async getAdministrativeDivisions(countryCode: string, parentId?: number): Promise<any[]> {
    return await this.addressService.getAdministrativeDivisions(countryCode, parentId);
  }

  async searchByAddress(searchTerm: string, limit: number = 20): Promise<ServiceWithType[]> {
    const repository = AppDataSource.getRepository(ServiceEntity);
    const services = await repository.find({
      where: { isActive: true },
      relations: ['serviceType'],
      take: limit
    });

    const filteredServices = services.filter(service =>
      service.streetAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return await this.serviceRepository.transformToServiceWithType(filteredServices);
  }
}
