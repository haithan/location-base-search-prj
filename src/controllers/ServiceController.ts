import { Request, Response } from 'express';
import { ServiceSearchService } from '../services/ServiceSearchService';
import { createError } from '../middleware/errorHandler';
import { SearchServicesResponse, ApiResponse, ServiceWithType } from '../types';

export class ServiceController {
  private serviceSearchService: ServiceSearchService;

  constructor() {
    this.serviceSearchService = new ServiceSearchService();
  }

  searchServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchParams = this.serviceSearchService.validateSearchParams(req.query);
      const result = await this.serviceSearchService.searchServices(searchParams, req.user?.userId);

      const response: ApiResponse<SearchServicesResponse> = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Latitude and longitude are required') ||
            error.message.includes('Invalid latitude') ||
            error.message.includes('Invalid longitude') ||
            error.message.includes('Invalid radius') ||
            error.message.includes('Invalid limit') ||
            error.message.includes('Invalid offset') ||
            error.message.includes('Invalid service type')) {
          throw createError(error.message, 400);
        }
      }
      throw error;
    }
  };

  getServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const serviceId = parseInt(req.params.serviceId);

      if (isNaN(serviceId) || serviceId <= 0) {
        throw createError('Invalid service ID', 400);
      }

      const service = await this.serviceSearchService.getServiceById(serviceId, req.user?.userId);

      const response: ApiResponse<typeof service> = {
        success: true,
        data: service,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'Service not found') {
        throw createError('Service not found', 404);
      }
      throw error;
    }
  };

  getServiceTypes = async (_req: Request, res: Response): Promise<void> => {
    try {
      const serviceTypes = await this.serviceSearchService.getAllServiceTypes();

      const response: ApiResponse<typeof serviceTypes> = {
        success: true,
        data: serviceTypes,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };

  getServicesByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const serviceTypeId = parseInt(req.params.typeId);
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (isNaN(serviceTypeId) || serviceTypeId <= 0) {
        throw createError('Invalid service type ID', 400);
      }

      const services = await this.serviceSearchService.getServicesByType(serviceTypeId, limit, offset, req.user?.userId);

      const response: ApiResponse<ServiceWithType[]> = {
        success: true,
        data: services,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };

  getPopularServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const services = await this.serviceSearchService.getPopularServices(limit, req.user?.userId);

      const response: ApiResponse<ServiceWithType[]> = {
        success: true,
        data: services,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };

  getCountries = async (_req: Request, res: Response): Promise<void> => {
    try {
      const countries = await this.serviceSearchService.getAllCountries();

      const response: ApiResponse<typeof countries> = {
        success: true,
        data: countries,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };

  getAdministrativeDivisions = async (req: Request, res: Response): Promise<void> => {
    try {
      const countryCode = req.params.countryCode as string;
      const parentId = req.query.parent_id ? parseInt(req.query.parent_id as string) : undefined;

      if (!countryCode || countryCode.length !== 2 && countryCode.length !== 3) {
        throw createError('Invalid country code', 400);
      }

      const divisions = await this.serviceSearchService.getAdministrativeDivisions(countryCode, parentId);

      const response: ApiResponse<typeof divisions> = {
        success: true,
        data: divisions,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };

  searchByAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!searchTerm || searchTerm.trim().length === 0) {
        throw createError('Search term is required', 400);
      }

      const services = await this.serviceSearchService.searchByAddress(searchTerm.trim(), limit, req.user?.userId);

      const response: ApiResponse<ServiceWithType[]> = {
        success: true,
        data: services,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };
}
