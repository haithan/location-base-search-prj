import { FavoriteRepository } from '../repositories/FavoriteRepository';
import { UserFavorite as UserFavoriteEntity } from '../entities/UserFavorite';
import { FavoriteServiceResponse } from '../types';

export class FavoriteModel {
  private favoriteRepository: FavoriteRepository;

  constructor() {
    this.favoriteRepository = new FavoriteRepository();
  }

  async addFavorite(userId: number, serviceId: number): Promise<UserFavoriteEntity> {
    return await this.favoriteRepository.addFavorite(userId, serviceId);
  }

  async removeFavorite(userId: number, serviceId: number): Promise<void> {
    await this.favoriteRepository.removeFavorite(userId, serviceId);
  }

  async findFavorite(userId: number, serviceId: number): Promise<UserFavoriteEntity | null> {
    return await this.favoriteRepository.findFavorite(userId, serviceId);
  }

  async getUserFavorites(userId: number): Promise<FavoriteServiceResponse[]> {
    return await this.favoriteRepository.getUserFavorites(userId);
  }

  async getUserFavoritesCount(userId: number): Promise<number> {
    return await this.favoriteRepository.getUserFavoriteCount(userId);
  }

  async isFavorite(userId: number, serviceId: number): Promise<boolean> {
    return await this.favoriteRepository.isFavorite(userId, serviceId);
  }

  async getFavoriteStats(serviceId: number): Promise<{ count: number }> {
    const count = await this.favoriteRepository.getFavoriteCount(serviceId);
    return { count };
  }

  async clearUserFavorites(userId: number): Promise<void> {
    await this.favoriteRepository.clearUserFavorites(userId);
  }
}
