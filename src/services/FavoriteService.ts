import { FavoriteModel } from '../models/Favorite';
import { ServiceModel } from '../models/Service';
import { UserFavorite, FavoriteServiceResponse } from '../types';

export class FavoriteService {
  private favoriteModel: FavoriteModel;
  private serviceModel: ServiceModel;

  constructor() {
    this.favoriteModel = new FavoriteModel();
    this.serviceModel = new ServiceModel();
  }

  async addFavorite(userId: number, serviceId: number): Promise<UserFavorite> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const existingFavorite = await this.favoriteModel.findFavorite(userId, serviceId);
    if (existingFavorite) {
      throw new Error('Service is already in favorites');
    }

    return await this.favoriteModel.addFavorite(userId, serviceId);
  }

  async removeFavorite(userId: number, serviceId: number): Promise<void> {
    const existingFavorite = await this.favoriteModel.findFavorite(userId, serviceId);
    if (!existingFavorite) {
      throw new Error('Service is not in favorites');
    }

    await this.favoriteModel.removeFavorite(userId, serviceId);
  }

  async getUserFavorites(userId: number, limit: number = 20, page: number = 1): Promise<{
    favorites: FavoriteServiceResponse[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  }> {
    const [allFavorites, totalCount] = await Promise.all([
      this.favoriteModel.getUserFavorites(userId),
      this.favoriteModel.getUserFavoritesCount(userId),
    ]);

    const offset = (page - 1) * limit;
    const favorites = allFavorites.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      favorites,
      total: totalCount,
      page,
      limit,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_previous: page > 1,
    };
  }

  async checkFavoriteStatus(userId: number, serviceId: number): Promise<{ is_favorite: boolean }> {
    const isFavorite = await this.favoriteModel.isFavorite(userId, serviceId);
    return { is_favorite: isFavorite };
  }

  async toggleFavorite(userId: number, serviceId: number): Promise<{
    is_favorite: boolean;
    favorite?: UserFavorite;
    message: string;
  }> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const isFavorite = await this.favoriteModel.isFavorite(userId, serviceId);

    let message: string;
    let favorite: UserFavorite | undefined = undefined;

    if (isFavorite) {
      await this.favoriteModel.removeFavorite(userId, serviceId);
      message = 'Service removed from favorites';
    } else {
      favorite = await this.favoriteModel.addFavorite(userId, serviceId);
      message = 'Service added to favorites';
    }

    return {
      is_favorite: !isFavorite,
      favorite,
      message,
    };
  }

  async clearAllFavorites(userId: number): Promise<void> {
    await this.favoriteModel.clearUserFavorites(userId);
  }

  async getFavoriteStats(serviceId: number): Promise<{ count: number }> {
    return await this.favoriteModel.getFavoriteStats(serviceId);
  }

  validateFavoriteRequest(body: any): { service_id: number } {
    const { service_id } = body;

    if (!service_id) {
      throw new Error('Service ID is required');
    }

    const serviceId = parseInt(service_id);
    if (isNaN(serviceId) || serviceId <= 0) {
      throw new Error('Invalid service ID');
    }

    return { service_id: serviceId };
  }

  validateServiceId(serviceId: string): number {
    const id = parseInt(serviceId);
    if (isNaN(id) || id <= 0) {
      throw new Error('Invalid service ID');
    }
    return id;
  }
}
