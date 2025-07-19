import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Service } from '../entities/Service';
import { ServiceWithType, SearchServicesRequest, PaginationParams } from '../types';
import { AddressService } from '../services/AddressService';

export class ServiceRepository {
  private repository: Repository<Service>;
  private addressService: AddressService;

  constructor() {
    this.repository = AppDataSource.getRepository(Service);
    this.addressService = new AddressService();
  }

  async findById(id: number): Promise<Service | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['serviceType']
    });
  }

  async searchServices(params: SearchServicesRequest & PaginationParams): Promise<{ services: ServiceWithType[], total: number }> {
    const queryBuilder = this.createSearchQuery(params);

    const total = await queryBuilder.getCount();

    const offset = (params.page - 1) * params.limit;
    const services = await queryBuilder
      .skip(offset)
      .take(params.limit)
      .getMany();

    const servicesWithType = await this.transformToServiceWithType(services, params.latitude, params.longitude);

    return { services: servicesWithType, total };
  }

  private createSearchQuery(params: SearchServicesRequest): SelectQueryBuilder<Service> {
    const queryBuilder = this.repository.createQueryBuilder('service')
      .leftJoinAndSelect('service.serviceType', 'serviceType')
      .where('service.isActive = :isActive', { isActive: true });

    if (params.latitude && params.longitude && params.radius) {
      const distanceFormula = `(6371 * acos(cos(radians(${params.latitude})) * cos(radians(service.latitude)) * cos(radians(service.longitude) - radians(${params.longitude})) + sin(radians(${params.latitude})) * sin(radians(service.latitude))))`;

      queryBuilder
        .addSelect(distanceFormula, 'distance')
        .andWhere(`${distanceFormula} <= :radius`)
        .setParameter('radius', params.radius)
        .orderBy('distance', 'ASC');
    }

    if (params.service_type) {
      queryBuilder.andWhere('service.serviceTypeId = :serviceTypeId', { serviceTypeId: params.service_type });
    }

    if (params.name) {
      queryBuilder.andWhere('service.name LIKE :name', { name: `%${params.name}%` });
    }

    return queryBuilder;
  }

  async transformToServiceWithType(services: Service[], userLat?: number, userLng?: number): Promise<ServiceWithType[]> {
    return services.map(service => {
      let distance: number | undefined;

      if (userLat && userLng) {
        distance = this.calculateDistance(userLat, userLng, service.latitude, service.longitude);
      }

      const country = this.addressService.getCountryByCode(service.countryCode);

      return {
        id: service.id,
        name: service.name,
        service_type_id: service.serviceTypeId,
        street_address: service.streetAddress,
        address_components: service.addressComponents || {},
        country_id: service.countryCode,
        latitude: service.latitude,
        longitude: service.longitude,
        phone: service.phone || undefined,
        website: service.website || undefined,
        rating: service.rating,
        is_active: service.isActive,
        created_at: service.createdAt,
        updated_at: service.updatedAt,
        service_type_name: service.serviceType.name,
        service_type_icon: service.serviceType.icon || undefined,
        country_name: country?.name || 'Unknown',
        country_code: service.countryCode,
        formatted_address: this.formatAddress(service),
        address_display: this.createAddressDisplay(service),
        distance
      };
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c;
    return Math.round(distanceInKm * 1000 * 10000) / 10000;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private formatAddress(service: Service): string {
    return service.streetAddress;
  }

  private createAddressDisplay(service: Service): { [key: string]: string } {
    const country = this.addressService.getCountryByCode(service.countryCode);
    return {
      street: service.streetAddress,
      country: country?.name || 'Unknown'
    };
  }

  async findByServiceType(serviceTypeId: number): Promise<Service[]> {
    return await this.repository.find({
      where: { serviceTypeId, isActive: true },
      relations: ['serviceType']
    });
  }

  async findByCountry(countryCode: string): Promise<Service[]> {
    return await this.repository.find({
      where: { countryCode, isActive: true },
      relations: ['serviceType']
    });
  }
}
