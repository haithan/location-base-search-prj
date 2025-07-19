import { Request, Response } from 'express';
import { FavoriteService } from '../services/FavoriteService';
import { createError } from '../middleware/errorHandler';
import { ApiResponse, FavoriteServiceResponse, AddFavoriteRequest } from '../types';

export class FavoriteController {
  private favoriteService: FavoriteService;

  constructor() {
    this.favoriteService = new FavoriteService();
  }

  addFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { service_id } = this.favoriteService.validateFavoriteRequest(req.body);
      const favorite = await this.favoriteService.addFavorite(req.user.userId, service_id);

      const response: ApiResponse<typeof favorite> = {
        success: true,
        data: favorite,
        message: 'Service added to favorites',
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Service is already in favorites') {
          throw createError('Service is already in favorites', 409);
        }
        if (error.message === 'Service not found') {
          throw createError('Service not found', 404);
        }
      }
      throw error;
    }
  };

  removeFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const serviceId = this.favoriteService.validateServiceId(req.params.serviceId);
      await this.favoriteService.removeFavorite(req.user.userId, serviceId);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Service removed from favorites',
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'Service is not in favorites') {
        throw createError('Service is not in favorites', 404);
      }
      throw error;
    }
  };

  getUserFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const page = parseInt(req.query.page as string) || 1;

      const result = await this.favoriteService.getUserFavorites(req.user.userId, limit, page);

      const response: ApiResponse<{
        favorites: FavoriteServiceResponse[];
        total: number;
        page: number;
        limit: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
      }> = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };

  checkFavoriteStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const serviceId = this.favoriteService.validateServiceId(req.params.serviceId);
      const result = await this.favoriteService.checkFavoriteStatus(req.user.userId, serviceId);

      const response: ApiResponse<{ is_favorite: boolean }> = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };

  toggleFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const serviceId = this.favoriteService.validateServiceId(req.params.serviceId);
      const result = await this.favoriteService.toggleFavorite(req.user.userId, serviceId);

      const response: ApiResponse<{
        is_favorite: boolean;
        favorite?: typeof result.favorite;
      }> = {
        success: true,
        data: {
          is_favorite: result.is_favorite,
          ...(result.favorite && { favorite: result.favorite }),
        },
        message: result.message,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'Service not found') {
        throw createError('Service not found', 404);
      }
      throw error;
    }
  };

  clearAllFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      await this.favoriteService.clearAllFavorites(req.user.userId);

      const response: ApiResponse<null> = {
        success: true,
        message: 'All favorites cleared',
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };
}
