import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const validateSearchParams = (req: Request, res: Response, next: NextFunction): void => {
  const { latitude, longitude, radius, limit, page } = req.query;

  if (!latitude || !longitude) {
    res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
    return;
  }

  const lat = parseFloat(latitude as string);
  if (isNaN(lat) || lat < -90 || lat > 90) {
    res.status(400).json({
      success: false,
      error: 'Invalid latitude. Must be between -90 and 90'
    });
    return;
  }

  const lng = parseFloat(longitude as string);
  if (isNaN(lng) || lng < -180 || lng > 180) {
    res.status(400).json({
      success: false,
      error: 'Invalid longitude. Must be between -180 and 180'
    });
    return;
  }

  let radiusValue = config.search.defaultRadius;
  if (radius) {
    radiusValue = parseFloat(radius as string);
    if (isNaN(radiusValue) || radiusValue <= 0 || radiusValue > config.search.maxRadius) {
      res.status(400).json({
        success: false,
        error: `Invalid radius. Must be between 0 and ${config.search.maxRadius} kilometers`
      });
      return;
    }
  }

  let limitValue = config.search.defaultLimit;
  if (limit) {
    limitValue = parseInt(limit as string);
    if (isNaN(limitValue) || limitValue <= 0 || limitValue > config.search.maxLimit) {
      res.status(400).json({
        success: false,
        error: `Invalid limit. Must be between 1 and ${config.search.maxLimit}`
      });
      return;
    }
  }

  let pageValue = 1;
  if (page) {
    pageValue = parseInt(page as string);
    if (isNaN(pageValue) || pageValue < 1) {
      res.status(400).json({
        success: false,
        error: 'Invalid page. Must be a positive integer'
      });
      return;
    }
  }

  req.query.latitude = lat.toString();
  req.query.longitude = lng.toString();
  req.query.radius = radiusValue.toString();
  req.query.limit = limitValue.toString();
  req.query.page = pageValue.toString();

  next();
};

export const validateUserRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({
      success: false,
      error: 'Username, email, and password are required'
    });
    return;
  }

  if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
    res.status(400).json({
      success: false,
      error: 'Username must be between 3 and 50 characters'
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== 'string' || !emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
    return;
  }

  if (typeof password !== 'string' || password.length < 6) {
    res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
    return;
  }

  next();
};

export const validateServiceId = (req: Request, res: Response, next: NextFunction): void => {
  const { serviceId } = req.params;
  const id = parseInt(serviceId);

  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid service ID'
    });
    return;
  }

  next();
};

export const validateFavoriteRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { service_id } = req.body;

  if (!service_id) {
    res.status(400).json({
      success: false,
      error: 'Service ID is required'
    });
    return;
  }

  const serviceId = parseInt(service_id);
  if (isNaN(serviceId) || serviceId <= 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid service ID'
    });
    return;
  }

  next();
};
