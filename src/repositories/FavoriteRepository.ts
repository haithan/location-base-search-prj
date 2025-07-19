import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { UserFavorite } from '../entities/UserFavorite';
import { FavoriteServiceResponse } from '../types';
import { AddressService } from '../services/AddressService';

export class FavoriteRepository {
  private repository: Repository<UserFavorite>;
  private addressService: AddressService;

  constructor() {
    this.repository = AppDataSource.getRepository(UserFavorite);
    this.addressService = new AddressService();
  }

  async addFavorite(userId: number, serviceId: number): Promise<UserFavorite> {
    const existing = await this.findFavorite(userId, serviceId);
    if (existing) {
      throw new Error('Service is already in favorites');
    }

    const favorite = this.repository.create({
      userId,
      serviceId
    });

    return await this.repository.save(favorite);
  }

  async removeFavorite(userId: number, serviceId: number): Promise<void> {
    const result = await this.repository.delete({ userId, serviceId });
    if (result.affected === 0) {
      throw new Error('Favorite not found');
    }
  }

  async findFavorite(userId: number, serviceId: number): Promise<UserFavorite | null> {
    return await this.repository.findOne({
      where: { userId, serviceId }
    });
  }

  async getUserFavorites(userId: number): Promise<FavoriteServiceResponse[]> {
    const favorites = await this.repository.find({
      where: { userId },
      relations: [
        'service',
        'service.serviceType'
      ],
      order: { createdAt: 'DESC' }
    });

    return favorites.map(favorite => {
      const country = this.addressService.getCountryByCode(favorite.service.countryCode);

      return {
        id: favorite.service.id,
        name: favorite.service.name,
        service_type_id: favorite.service.serviceTypeId,
        street_address: favorite.service.streetAddress,
        address_components: favorite.service.addressComponents || {},
        country_id: favorite.service.countryCode,
        latitude: favorite.service.latitude,
        longitude: favorite.service.longitude,
        phone: favorite.service.phone || undefined,
        website: favorite.service.website || undefined,
        rating: favorite.service.rating,
        is_active: favorite.service.isActive,
        created_at: favorite.service.createdAt,
        updated_at: favorite.service.updatedAt,
        service_type_name: favorite.service.serviceType.name,
        service_type_icon: favorite.service.serviceType.icon || undefined,
        country_name: country?.name || 'Unknown',
        country_code: favorite.service.countryCode,
        formatted_address: favorite.service.streetAddress,
        address_display: { street: favorite.service.streetAddress },
        favorited_at: favorite.createdAt
      };
    });
  }

  async isFavorite(userId: number, serviceId: number): Promise<boolean> {
    const favorite = await this.findFavorite(userId, serviceId);
    return !!favorite;
  }

  async getFavoriteCount(serviceId: number): Promise<number> {
    return await this.repository.count({ where: { serviceId } });
  }

  async getUserFavoriteCount(userId: number): Promise<number> {
    return await this.repository.count({ where: { userId } });
  }

  async clearUserFavorites(userId: number): Promise<void> {
    await this.repository.delete({ userId });
  }
}
